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
    const [wifiName, gatewayMac] = payload.split('/');

    if (!wifiName || !gatewayMac) {
      throw new Error('Invalid message format. Expected format: wifiName/gatewayMac');
    }

    const saved = await newGateway.create({
      wifiName,
      gatewayMac,
    });

    console.log('Message saved:', saved._id);
  } catch (err) {
    console.error('Parse or DB error:', err.message);
  }
});
