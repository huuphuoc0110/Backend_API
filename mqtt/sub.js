// mqtt/client.js
const { Sensors, Gateways, Node, newGateway, Schedules, Devices, Conditions } = require("../model/model");
const mongoose = require("mongoose");
const cron = require('node-cron');
const moment = require('moment-timezone');
let gotResponseMap


const mqtt = require('mqtt');
const options = {
  host: '3e35b0e456934dc0bbb79dfe4d03461e.s1.eu.hivemq.cloud',
  port: 8883, // Port cho MQTT over TLS (bảo mật)
  protocol: 'mqtts',
  username: 'VanTu1208',
  password: 'Thuhoai17'
};
const client = mqtt.connect(options);

// const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

//Hàm tính trung bình data
function calculateHourlyAverage(todayBlock) {
  if (!todayBlock || !Array.isArray(todayBlock.dataMinute) || todayBlock.dataMinute.length === 0) {
    console.log('dataMinute is empty or invalid');
    return [];
  }

  const hourlyMap = {};

  for (const entry of todayBlock.dataMinute) {
    if (!entry.time || entry.value === undefined) {
      console.warn('Entry thiếu time hoặc value:', entry);
      continue;
    }

    // Dùng UTC luôn, không xử lý timezone
    const time = new Date(entry.time);
    const hour = new Date(time);
    hour.setMinutes(0, 0, 0); // reset về đầu giờ

    const hourKey = hour.toISOString(); // dùng ISO string làm key

    if (!hourlyMap[hourKey]) {
      hourlyMap[hourKey] = { sum: 0, count: 0 };
    }

    const val = parseFloat(entry.value);
    if (isNaN(val)) {
      console.warn('Value không phải số:', entry.value);
      continue;
    }

    hourlyMap[hourKey].sum += val;
    hourlyMap[hourKey].count += 1;
  }

  const hourlyAverages = [];

  for (const hourKey in hourlyMap) {
    const { sum, count } = hourlyMap[hourKey];
    const avg = sum / count;

    hourlyAverages.push({
      time: new Date(hourKey), // vẫn lưu Date theo UTC
      value: parseFloat(avg.toFixed(2))
    });
  }

  console.log('hourlyAverages (UTC):', hourlyAverages);
  return hourlyAverages;
}

async function publishAllSchedules() {
  try {
    const schedules = await Schedules.find()
      .populate('gatewayId')
      .populate('nodeId');

    // Lấy thời gian hiện tại theo múi giờ Việt Nam
    const nowVN = moment().tz('Asia/Ho_Chi_Minh');
    const nowHour = nowVN.hour();
    const nowMinute = nowVN.minute();

    // console.log(`⏰ Thời gian hiện tại (VN): ${nowVN.format('YYYY-MM-DD HH:mm:ss')}`);
    // console.log(`➡️ Giờ hiện tại: ${nowHour}, Phút hiện tại: ${nowMinute}`);

    for (const schedule of schedules) {
      if (!schedule.gatewayId || !schedule.nodeId) {
        console.warn(`⚠️ Thiếu gatewayId hoặc nodeId ở schedule ${schedule._id}`);
        continue;
      }

      // Parse startTime từ string "HH:mm"
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      // console.log(`📅 Schedule "${schedule.deviceName}" startTime: ${schedule.startTime} → Giờ: ${startHour}, Phút: ${startMinute}`);

      const isMatchTime = nowHour === startHour && nowMinute === startMinute;

      if (!isMatchTime) {
        // console.log(`⏩ Bỏ qua schedule ${schedule._id} - Không trùng giờ`);
        continue;
      }

      const status = schedule.status;
      const gatewayName = schedule.gatewayId.gatewayName;
      const nodeAddh = schedule.nodeId.nodeAddh;
      const nodeAddl = schedule.nodeId.nodeAddl;
      const id = schedule.devicePin;
      const deviceName = schedule.deviceName;

      const actionText = status === true ? "BẬT" : "TẮT";
      const actionNumber = status === true ? "1" : "0";
      const topic = `${gatewayName}/controls/${nodeAddh}/${nodeAddl}/${id}/command`;
      gotResponseMap = false;
      for (let i = 1; i <= 3; i++) {
        if (gotResponseMap) {
          console.log(`✅ Đã nhận phản hồi từ "${deviceName}", dừng gửi`);
          break;
        }

        console.log(`📡 [Lần ${i}] Gửi lệnh "${actionText}" tới "${deviceName}" → ${topic}`);
        client.publish(topic, String(actionNumber));
        if (i <= 3) {
          // 🕒 Chờ 5 giây trước lần gửi tiếp theo
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      // Nếu sau 3 lần mà không có phản hồi
      if (!gotResponseMap) {
        console.warn(`❌ Không có phản hồi từ "${deviceName}" sau 3 lần gửi`);
      } else if (!schedule.dailyRepeat) {
        try {
          await Schedules.findByIdAndDelete(schedule._id);
          console.log(`🗑️ Đã xoá schedule ${schedule._id} vì không lặp lại`);
        } catch (deleteErr) {
          console.error(`❌ Lỗi xoá schedule ${schedule._id}:`, deleteErr);
        }
      }

    }
  } catch (err) {
    console.error('❌ Lỗi khi publish all schedules:', err);
  }
}

async function publishAllConditions() {
  try {
    const conditions = await Conditions.find()
      .populate('gatewayId')
      .populate('nodeId');
    for (const condition of conditions) {
      if (!condition.gatewayId || !condition.nodeId) {
        console.warn(`⚠️ Thiếu gatewayId hoặc nodeId ở condtion ${condition._id}`);
        continue;
      }

      const devicePin = condition.devicePin;
      const status = condition.status;
      const sensorType = condition.sensorType;
      const minValue = condition.minValue;
      const maxValue = condition.maxValue;

      const gatewayName = condition.gatewayId?.gatewayName;    // hoặc condition.gatewayId.gatewayName
      const nodeAddh = condition.nodeId?.nodeAddh;
      const nodeAddl = condition.nodeId?.nodeAddl;

      const topic = `${gatewayName}/controls/${nodeAddh}/${nodeAddl}/${devicePin}/command`;

      //Lưu trạng thái ban đầu của Devices
      const device = await Devices.findOne({
        gatewayId: condition.gatewayId._id,
        nodeId: condition.nodeId._id,
        pin: String(devicePin),
      });

      if (!device) {
        console.warn(`⚠️ Không tìm thấy thiết bị tại condition ${condition._id}`);
        continue;
      }

      //Lấy giá trị sensor để so sánh 
      const sensor = await Sensors.findOne({
        gatewayId: condition.gatewayId._id,
        nodeId: condition.nodeId._id,
        sensorType: sensorType, // Đảm bảo schema Sensors có field này
      });

      if (!sensor || !sensor.data?.today?.dataMinute?.length) {
        console.warn(`⚠️ Không tìm thấy sensor hoặc không có dữ liệu tại condition ${id}`);
        continue;
      }

      const latestData = sensor.data.today.dataMinute.at(-1); // lấy giá trị mới nhất
      const value = latestData.value;

      if (typeof value !== 'number') {
        console.warn(`⚠️ Giá trị sensor không hợp lệ tại condition ${id}`);
        continue;
      }

      const isWithinRange =
        minValue !== undefined &&
        maxValue !== undefined &&
        value >= minValue &&
        value <= maxValue;

      let nextStatus;

      if (device.defaultStatus === undefined || device.conditionFlag === undefined) {
        device.defaultStatus = device.status;
        device.conditionFlag = false;
        await device.save();
      }

      if (isWithinRange) {
        if (!device.conditionFlag) {
          nextStatus = status; // Theo condition.status
          device.conditionFlag = true;
          await device.save();
        } else {
          console.log("TRONG ĐIỀU KIỆN KHÔNG CẦN PUBLISH");
          break;
        }
      } else {
        if (device.conditionFlag) {
          nextStatus = device.defaultStatus; // Theo condition.status
          device.conditionFlag = false;
          await device.save();
        } else {
          console.log("Thiết bị ở trạng thái đặt điều, kh cần publish");
          break;
        }
      }

      const actionText = nextStatus ? "BẬT" : "TẮT";
      const actionNumber = nextStatus ? "1" : "0";

      client.publish(topic, String(actionNumber));
      console.log(`📡 Giá trị = ${value} (${isWithinRange ? "TRONG" : "NGOÀI"} khoảng) → Gửi lệnh ${actionText} tới ${topic}`);
    }

    const allDevices = await Devices.find();
    let stillHasCondition
    for (const devices of allDevices) {
      stillHasCondition = await Conditions.exists({
        gatewayId: devices.gatewayId,
        nodeId: devices.nodeId,
        pin: devices.devicePin,
      });
      if (!stillHasCondition && devices.defaultStatus !== undefined) {
        devices.status = devices.defaultStatusBeforeCondition ?? devices.status;
        devices.defaultStatus = undefined;
        devices.conditionFlag = false;
        await devices.save();

        console.log(`🔁 Đã reset trạng thái thiết bị ${devices.name} vì không còn điều kiện nào`);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi trong publishAllConditions:", err);
  }
}



client.on('connect', () => {
  console.log('MQTT Connected');
  publishAllSchedules();

  cron.schedule('0 * * * * *', () => {
    console.log('⏱️ Cron chạy lúc:', moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss'));
    publishAllSchedules();
  });

  client.subscribe('newGateway/response', (err) => {
    if (err) {
      console.error('Subscribe error:', err);
    } else {
      console.log('Subscribed to newGateway/response');
    }
  });
  client.subscribe('+\/+\/+\/sensors/response', (err) => {
    if (!err) {
      console.log('Subscribed to sensor response topics!');
    }
  });
  client.subscribe('+\/controls\/+\/+\/+/response', (err) => {
    if (!err) {
      console.log('✅ Subscribed to control response topics');
    }
  });
});

client.on('message', async (topic, message) => {
  //___________________________________________________________________________//
  if (topic === 'newGateway/response') {
    const msgStr = message.toString();
    const parts = msgStr.split('/');
    if (parts.length === 2) {
      const wifiName = parts[0];
      const gatewayMac = parts[1];

      try {
        const gateway = new newGateway({ wifiName, gatewayMac });
        gateway.id = String(gateway._id);
        await gateway.save();
        console.log('Gateway saved:', gateway);
      } catch (err) {
        console.error('Error saving gateway:', err);
      }
    } else {
      console.warn('Message format không đúng:', msgStr);
    }
  };

  //___________________________________________________________________________//
  if (topic.endsWith('/sensors/response')) {
    const parts = topic.split('/');
    console.log(parts);

    if (parts.length === 5) {
      const [gatewayName, nodeAddh, nodeAddl] = parts;

      try {
        const sensorList = JSON.parse(message.toString());

        const gateway = await Gateways.findOne({ gatewayName: gatewayName });

        const node = await Node.findOne({ nodeAddh: nodeAddh, nodeAddl: nodeAddl, gatewayId: gateway._id});

        if (!gateway) {
          console.warn('⚠️ Gateway không tồn tại!');
          return;
        }

        if (!node) {
          console.warn('⚠️ Node không tồn tại!');
          return;
        }

        for (const sensorData of sensorList) {
          const pin = sensorData.Pin;
          const value = sensorData.Value;
          const timeNow = new Date();

          const sensor = await Sensors.findOne({
            sensorType: pin,
            gatewayId: gateway._id,
            nodeId: node._id
          });

          if (!sensor) {
            console.warn(`⚠️ Không tìm thấy sensor với PIN: ${pin}`);
            continue;
          }

          if (!sensor.data || typeof sensor.data !== 'object') {
            sensor.data = {};
          }

          if (!sensor.data.today || typeof sensor.data.today !== 'object') {
            sensor.data.today = {};
          }

          if (!Array.isArray(sensor.data.today.dataMinute)) {
            if (typeof sensor.data.today.dataMinute === 'string') {
              try {
                sensor.data.today.dataMinute = JSON.parse(sensor.data.today.dataMinute);
                if (!Array.isArray(sensor.data.today.dataMinute)) {
                  sensor.data.today.dataMinute = [];
                }
              } catch {
                sensor.data.today.dataMinute = [];
              }
            } else {
              sensor.data.today.dataMinute = [];
            }
          }

          if (!Array.isArray(sensor.data.today.dataHour)) {
            sensor.data.today.dataHour = [];
          }

          sensor.data.today.dataMinute.push({
            time: new Date(),
            value: Number(value)
          });

          sensor.data.today.dataHour = calculateHourlyAverage(sensor.data.today);

          await sensor.save();
          console.log(`✅ Lưu dataMinute cho sensor PIN ${pin}: ${value}`);
        }
        publishAllConditions();
      } catch (err) {
        console.error('❌ Lỗi xử lý message hoặc ghi DB:', err);
      }

    } else {
      console.warn('❗Topic không đúng định dạng:', topic);
    }
  };

  if (topic.includes('/controls/') && topic.endsWith('/response')) {
    const parts = topic.split('/');
    const payload = message.toString();

    if (parts.length === 6) {
      const [gatewayName, , nodeAddh, nodeAddl, id] = parts;

      if (payload === '1' || payload === '0') {
        const statusBool = payload === '1';

        console.log(`✅ Nhận phản hồi từ thiết bị:`);
        console.log(`→ Gateway: ${gatewayName}`);
        console.log(`→ Node: ${nodeAddh}-${nodeAddl}`);
        console.log(`→ ID: ${id}`);
        console.log(`→ Trạng thái thực hiện: ${statusBool ? 'BẬT' : 'TẮT'}`);

        gotResponseMap = true;

        try {
          // Tìm gateway và node
          const gateway = await Gateways.findOne({ gatewayName });
          const node = await Node.findOne({ nodeAddh, nodeAddl });

          if (!gateway || !node) {
            console.warn('⚠️ Không tìm thấy Gateway hoặc Node!');
            return;
          }

          // Tìm thiết bị theo gatewayId, nodeId, devicePin
          const device = await Devices.findOne({
            gatewayId: gateway._id,
            nodeId: node._id,
            pin: id.toString(),
          });

          if (!device) {
            console.warn(`⚠️ Không tìm thấy thiết bị với pin ${id}`);
            return;
          }

          // Cập nhật status
          device.status = statusBool;
          await device.save();

          console.log(`✅ Đã cập nhật trạng thái thiết bị ${device.deviceName} (${id}) → ${statusBool ? 'BẬT' : 'TẮT'}`);
        } catch (err) {
          console.error('❌ Lỗi khi cập nhật trạng thái thiết bị:', err);
        }

      } else {
        console.warn(`⚠️ Message phản hồi không hợp lệ: ${payload}`);
      }
    } else {
      console.warn(`⚠️ Topic không đúng định dạng: ${topic}`);
    }
  }
});

const moveTodayToPastDay = async () => {
  console.log('🕛 Chạy cron chuyển today → pastDay theo giờ VN');

  const sensors = await Sensors.find();

  for (const sensor of sensors) {
    if (!sensor.data) continue;

    const todayData = sensor.data.today;
    if (!todayData) continue;

    const { dataMinute, dataHour } = todayData;

    if (
      (!dataMinute || dataMinute.length === 0) &&
      (!dataHour || dataHour.length === 0)
    ) {
      continue;
    }

    const newPastDayEntry = {
      date: moment.tz('Asia/Ho_Chi_Minh')
        .subtract(1, 'day')
        .startOf('day')
        .toDate(), // sẽ trả về 2025-06-11T17:00:00.000Z nếu là đầu ngày 13/06 VN
      dataMinute: dataMinute || [],
      dataHour: dataHour || []
    };

    // Đảm bảo mảng pastDay đã khởi tạo
    if (!sensor.data.pastDay) {
      sensor.data.pastDay = [];
    }

    sensor.data.pastDay.push(newPastDayEntry);

    // Reset today
    sensor.data.today = {
      dataMinute: [],
      dataHour: []
    };

    await sensor.save();
    console.log(`✅ Đã chuyển today → pastDay cho sensor ${sensor._id}`);
  }
};

cron.schedule('0 0 * * *', async () => {
  try {
    await moveTodayToPastDay();
    // console.log("Cron thanh cong");
  } catch (err) {
    console.error('❌ Cron job lỗi:', err);
  }
}, {
  timezone: "Asia/Ho_Chi_Minh"
});


module.exports = { moveTodayToPastDay, publishAllSchedules };
