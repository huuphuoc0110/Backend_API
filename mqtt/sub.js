// mqtt/sub.js
const client = require('./client');
const { newGateway } = require("../model/model");
const topic = 'newGateway/response';

client.subscribe(topic, (err) => {
  if (!err) {
    console.log(`Subscribed to topic: ${topic}`);
  } else {
    console.error('Subscription error:', err);
  }
});

client.on('message', async (topic, message) => {
  const payload = message.toString();
  console.log(`[Subscriber] ${topic}: ${payload}`);

  try {
    const data = JSON.parse(payload); // parse JSON

    const saved = await newGateway.create({
      wifiName: data.wifiName,
      gatewayMac: data.gatewayMac,
    });

    console.log('Message saved:', saved._id);
  } catch (err) {
    console.error('Invalid message or DB error:', err.message);
  }
});
