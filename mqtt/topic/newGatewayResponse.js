const { newGateway } = require("../../model/model");

module.exports = async function handleNewGatewayResponse(message) {
  const payload = message.toString();
  console.log(`[Handler] newGateway/response: ${payload}`);

  const [wifiName, gatewayMac] = payload.split('/');
  if (!wifiName || !gatewayMac) {
    throw new Error('Invalid message format. Expected: wifiName/gatewayMac');
  }

  const saved = await newGateway.create({ wifiName, gatewayMac });
  console.log('Gateway saved:', saved._id);
};
