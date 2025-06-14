
const newGatewayController = require("../controller/newGatewayController");

const router = require("express").Router();

//Find gateways
router.get("/", verifyApiKey, newGatewayController.getNewGateways);

//Replace gateways
router.patch("/:_id", verifyApiKey, newGatewayController.updateGateways);

module.exports = router;