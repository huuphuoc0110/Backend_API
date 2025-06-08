// mqtt/client.js
const { Sensors, Gateways, Node, newGateway } = require("../model/model");
const mongoose = require("mongoose");
const cron = require('node-cron');
const moment = require('moment-timezone');

const mqtt = require('mqtt');
const options = {
  host: '3e35b0e456934dc0bbb79dfe4d03461e.s1.eu.hivemq.cloud',
  port: 8883, // Port cho MQTT over TLS (bảo mật)
  protocol: 'mqtts',
  username: 'VanTu1208',
  password: 'Thuhoai17'
};

const client = mqtt.connect(options);

function calculateHourlyAverage(todayBlock) {
  const hourlyMap = {};

  for (const entry of todayBlock.dataMinute) {
    // parse time theo timezone VN
    const time = moment.tz(entry.time, 'Asia/Ho_Chi_Minh').toDate();
    // lấy chuỗi yyyy-mm-ddThh làm key giờ
    const hourKey = moment(time).format('YYYY-MM-DDTHH'); // ví dụ "2025-06-02T10"

    if (!hourlyMap[hourKey]) {
      hourlyMap[hourKey] = {
        sum: 0,
        count: 0
      };
    }

    hourlyMap[hourKey].sum += parseFloat(entry.value);
    hourlyMap[hourKey].count += 1;
  }

  const hourlyAverages = [];

  for (const hour in hourlyMap) {
    const { sum, count } = hourlyMap[hour];
    const avg = sum / count;

    // tạo thời gian đúng đầu giờ theo VN timezone và convert về ISO string chuẩn UTC
    const timeVN = moment.tz(hour, 'YYYY-MM-DDTHH', 'Asia/Ho_Chi_Minh')
      .startOf('hour')
      .toDate();

    hourlyAverages.push({
      time: timeVN,
      value: avg.toFixed(2)
    });
  }

  return hourlyAverages;
}

client.on('connect', () => {
  console.log('MQTT Connected');
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

        // Tìm gateway và node trong DB
        const gateway = await Gateways.findOne({ gatewayName: gatewayName });
        const nodes = await Node.findOne({ nodeAddh: nodeAddh, nodeAddl: nodeAddl });

        if (!gateway) {
          console.warn('⚠️ Gateway không tồn tại!');
          return;
        }
        if (!nodes) {
          console.warn('⚠️ Node không tồn tại!');
          return;
        }
        for (const sensorData of sensorList) {
          const pin = sensorData.Pin;
          const value = sensorData.Value;
          const timeNow = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
          console.log(timeNow);
          const sensor = await Sensors.findOne({
            sensorType: pin,
            gatewayId: gateway._id,
            nodeId: nodes._id
          });

          if (!sensor) {
            console.warn(`⚠️ Không tìm thấy sensor với PIN: ${pin}`);
            continue;
          }

          if (!sensor.data || sensor.data.length === 0) {
            sensor.data = [{
              today: [{
                dataMinute: [],
                dataHour: []
              }],
              pastDay: []
            }];
          }

          const todayBlock = sensor.data[0].today[0];
          if (!todayBlock) {
            console.warn(`⚠️ Sensor PIN ${pin} không có today block`);
            continue;
          }

          todayBlock.dataMinute.push({
            time: timeNow,
            value: value.toString()
          });

          todayBlock.dataHour = calculateHourlyAverage(todayBlock);

          await sensor.save();
          console.log(`✅ Lưu dataMinute cho sensor PIN ${pin}: ${value}`);
        }
      } catch (err) {
        console.error('❌ Lỗi xử lý message hoặc ghi DB:', err);
      }

    } else {
      console.warn('❗Topic không đúng định dạng:', topic);
    }
  }
});

const moveTodayToPastDay = async () => {
  console.log('🕛 Chạy cron chuyển today → pastDay theo giờ VN');

  const sensors = await Sensors.find();

  for (const sensor of sensors) {
    if (!sensor.data || sensor.data.length === 0) continue;

    const todayBlock = sensor.data[0].today[0];
    if (!todayBlock) continue;

    if (
      (!todayBlock.dataMinute || todayBlock.dataMinute.length === 0) &&
      (!todayBlock.dataHour || todayBlock.dataHour.length === 0)
    ) {
      continue;
    }

    sensor.data[0].pastDay.push({
      date: moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD'),
      dataMinute: todayBlock.dataMinute || [],
      dataHour: todayBlock.dataHour || []
    });

    sensor.data[0].today[0] = {
      dataMinute: [],
      dataHour: []
    };

    await sensor.save();
    console.log(`✅ Đã chuyển today → pastDay cho sensor ${sensor._id}`);
  }
};

cron.schedule('00 00 * * *', async () => {
  try {
    await moveTodayToPastDay();
  } catch (err) {
    console.error('❌ Cron job lỗi:', err);
  }
}, {
  timezone: "Asia/Ho_Chi_Minh"
});

module.exports = { moveTodayToPastDay };
