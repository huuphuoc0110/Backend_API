// mqtt/client.js
const { Sensors, Gateways, Node } = require("../model/model");
const mongoose = require("mongoose");

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

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
  //___________________________________________________________________________//
  //___________________________________________________________________________//
  //___________________________________________________________________________//
  //___________________________________________________________________________//
  if (topic.endsWith('/sensors/response')) {
    const parts = topic.split('/');
    console.log(parts);
    if (parts.length === 5) {
      // destruct 3 phần đầu, bỏ 2 phần cuối (hoặc bạn cần dùng phần nào thì sửa)
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

        const now = new Date();
        const timeStr = now.toISOString();
        const currentDateStr = timeStr.slice(0, 10); // YYYY-MM-DD

        // Thời gian bắt đầu giờ hiện tại (UTC)
        const hourStart = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(), 0, 0, 0
        ));
        const hourStartStr = hourStart.toISOString();
        const nextHourStr = new Date(hourStart.getTime() + 3600000).toISOString();

        for (const sensor of sensorList) {
          const pin = sensor.Pin.toString();
          const value = sensor.Value.toString();

          const existingSensor = await Sensors.findOne({
            gatewayId: gateway._id,
            nodeId: nodes._id,
            sensorType: pin
          });

          if (!existingSensor) {
            console.warn(`⚠️ Sensor không tồn tại (Pin: ${pin}), bỏ qua.`);
            continue;
          }

          // Khởi tạo cấu trúc nếu thiếu
          if (!existingSensor.data) existingSensor.data = [];
          if (existingSensor.data.length === 0) {
            existingSensor.data.push({
              today: { dataMinute: [], dataHour: [] },
              pastDay: []
            });
          } else {
            if (!existingSensor.data[0].today) existingSensor.data[0].today = { dataMinute: [], dataHour: [] };
            if (!existingSensor.data[0].pastDay) existingSensor.data[0].pastDay = [];
          }

          // 1. Thêm dữ liệu mới vào today.dataMinute
          existingSensor.data[0].today.dataMinute.push({ time: timeStr, value });

          // 2. Cập nhật dataHour trong today
          const todayMinutesInHour = existingSensor.data[0].today.dataMinute.filter(item =>
            item.time >= hourStartStr && item.time < nextHourStr
          );
          const sumToday = todayMinutesInHour.reduce((acc, item) => acc + parseFloat(item.value), 0);
          const avgToday = sumToday / todayMinutesInHour.length;

          let hourRecordToday = existingSensor.data[0].today.dataHour.find(item => item.time === hourStartStr);
          if (hourRecordToday) {
            hourRecordToday.value = avgToday.toFixed(2);
            hourRecordToday.time = hourStartStr;
          } else {
            existingSensor.data[0].today.dataHour.push({ time: hourStartStr, value: avgToday.toFixed(2) });
          }

          // 3. Tìm hoặc tạo đối tượng pastDay cho ngày hiện tại
          let pastDayRecord = existingSensor.data[0].pastDay.find(item => item.date === currentDateStr);
          if (!pastDayRecord) {
            pastDayRecord = { date: currentDateStr, dataMinute: [], dataHour: [] };
            existingSensor.data[0].pastDay.push(pastDayRecord);
          }

          // 4. Thêm dữ liệu mới vào pastDay.dataMinute
          pastDayRecord.dataMinute.push({ time: timeStr, value });

          // 5. Cập nhật dataHour trong pastDay
          const pastDayMinutesInHour = pastDayRecord.dataMinute.filter(item =>
            item.time >= hourStartStr && item.time < nextHourStr
          );
          const sumPastDay = pastDayMinutesInHour.reduce((acc, item) => acc + parseFloat(item.value), 0);
          const avgPastDay = sumPastDay / pastDayMinutesInHour.length;

          let hourRecordPastDay = pastDayRecord.dataHour.find(item => item.time === hourStartStr);
          if (hourRecordPastDay) {
            hourRecordPastDay.value = avgPastDay.toFixed(2);
            hourRecordPastDay.time = hourStartStr;
          } else {
            pastDayRecord.dataHour.push({ time: hourStartStr, value: avgPastDay.toFixed(2) });
          }

          // 6. Lưu lại database
          await existingSensor.save();
        }
      } catch (err) {
        console.error('❌ Lỗi xử lý message hoặc ghi DB:', err);
      }

    } else {
      console.warn('❗Topic không đúng định dạng:', topic);
    }
  }


});