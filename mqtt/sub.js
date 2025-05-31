// mqtt/client.js
const { newGateway } = require("../model/model");
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
        const gateway = new newGateway({wifiName,gatewayMac});
        gateway.id = String(gateway._id);
        await gateway.save();
        console.log('Gateway saved:', gateway);
      } catch (err) {
        console.error('Error saving gateway:', err);
      }
    } else {
      console.warn('Message format không đúng:', msgStr);
    }
  }

  //___________________________________________________________________________//
  //___________________________________________________________________________//
  //___________________________________________________________________________//
  //___________________________________________________________________________//
  //___________________________________________________________________________//
});