// mqtt/client.js
const { Sensors, Gateways, Node, newGateway } = require("../model/model");
const mongoose = require("mongoose");
const cron = require('node-cron');
const moment = require('moment-timezone');

const mqtt = require('mqtt');
// const options = {
//   host: '3e35b0e456934dc0bbb79dfe4d03461e.s1.eu.hivemq.cloud',
//   port: 8883, // Port cho MQTT over TLS (bảo mật)
//   protocol: 'mqtts',
//   username: 'VanTu1208',
//   password: 'Thuhoai17'
// };

// const client = mqtt.connect(options);

const client = mqtt.connect('mqtt://broker.hivemq.com:1883');


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

        const gateway = await Gateways.findOne({ gatewayName: gatewayName });
        const node = await Node.findOne({ nodeAddh: nodeAddh, nodeAddl: nodeAddl });

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
