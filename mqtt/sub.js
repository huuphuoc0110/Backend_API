const client = require('./client');
const handleNewGatewayResponse = require('./topic/newGatewayResponse');
const handleSensorsResponse = require('./topic/sensorData');

// Hàm lấy handler theo topic
function getHandlerByTopic(topic) {
  if (topic.endsWith('sensors/response')) return handleSensorsResponse;
  if (topic === 'newGateway/response') return handleNewGatewayResponse;
  // Các trường hợp khác
  return null;
}

// Đăng ký subscribe các topic cố định (hoặc có thể subscribe wildcard + filter trong handler)
const topicsToSubscribe = [
  'newGateway/response',
  '+/+/+/sensors/response', // nếu broker hỗ trợ MQTT wildcards và bạn muốn subscribe wildcard
];

// Subscribe tất cả topic trong list
topicsToSubscribe.forEach(topic => {
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log(`Subscribed to topic: ${topic}`);
    } else {
      console.error(`Error subscribing to ${topic}:`, err.message);
    }
  });
});

// Xử lý message đến theo handler tương ứng
client.on('message', async (topic, message) => {
  const handler = getHandlerByTopic(topic);
  if (!handler) {
    console.warn(`No handler for topic: ${topic}`);
    return;
  }

  try {
    await handler(topic, message);
  } catch (err) {
    console.error(`Error handling topic ${topic}:`, err.message);
  }
});
