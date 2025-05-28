// mqtt/client.js
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log('MQTT Connected (client.js)');
});

module.exports = client;
