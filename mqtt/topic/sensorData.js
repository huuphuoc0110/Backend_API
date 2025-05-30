const mongoose = require('mongoose');
const { Sensors, Gateways, Node } = require('../../model/model');

module.exports = async function handleSensorsResponse(topic, message) {
  try {
    const topicStr = topic.toString();
    if (!topicStr.endsWith('sensors/response')) return;

    const parts = topicStr.split('/');
    if (parts.length !== 5) {
      console.error('Topic format sai:', topicStr);
      return;
    }
    const [gatewayName, nodeAddh, nodeAddl] = parts;

    const sensorsData = JSON.parse(message.toString());
    if (!Array.isArray(sensorsData)) {
      console.error('Dữ liệu message không phải mảng:', sensorsData);
      return;
    }

    const gateway = await Gateways.findOne({ gatewayName: gatewayName });
    if (!gateway) {
      console.error('Không tìm thấy gateway:', gatewayName);
      return;
    }

    const node = await Node.findOne({
      gatewayId: gateway._id,
      nodeAddh: nodeAddh,
      nodeAddl: nodeAddl,
    });
    if (!node) {
      console.error('Không tìm thấy node:', nodeAddh, nodeAddl);
      return;
    }

    const now = new Date();
    const timeStr = now.toISOString();

    for (const sensor of sensorsData) {
      const { Pin, Value } = sensor;
      if (typeof Pin !== 'number' || Value === undefined) {
        console.warn('Dữ liệu sensor không hợp lệ:', sensor);
        continue;
      }

      const sensorType = `${Pin}`;

      const sensorDoc = await Sensors.findOne({ nodeId: node._id, sensorType });
      if (!sensorDoc) {
        console.warn(`Sensor ${sensorType} của node ${node._id} không tồn tại, bỏ qua`);
        continue;
      }

      if (!sensorDoc.data || sensorDoc.data.length === 0) {
        sensorDoc.data = [{
          today: { dataMinute: [], dataHour: [] },
          pastDay: []
        }];
      } else if (!sensorDoc.data[0].today) {
        sensorDoc.data[0].today = { dataMinute: [], dataHour: [] };
      }

      const todayData = sensorDoc.data[0].today;

      // Thêm dữ liệu mới vào dataMinute
      todayData.dataMinute.push({
        time: timeStr,
        value: Value.toString(),
      });

      // Giới hạn tối đa 60 phần tử
      if (todayData.dataMinute.length > 60) {
        todayData.dataMinute.shift();
      }

      // Tính trung bình từ tất cả dataMinute hiện tại
      const values = todayData.dataMinute.map(d => parseFloat(d.value));
      if (values.length > 0) {
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;

        todayData.dataHour.push({
          time: timeStr,
          value: avg.toFixed(2),
        });
      }

      await sensorDoc.save();
    }

    console.log(`Đã cập nhật dữ liệu sensors cho node ${nodeAddh}-${nodeAddl}`);
  } catch (error) {
    console.error('Lỗi xử lý sensors response:', error);
  }
};
