
const newGatewayController = require("../controller/newGatewayController");
const verifyApiKey = require('../middleware/verifyApiKey'); // KHÔNG sai đường dẫn
const router = require("express").Router();

//Find gateways
router.get("/", verifyApiKey, newGatewayController.getNewGateways);

//Replace gateways
router.patch("/:_id", verifyApiKey, newGatewayController.updateGateways);

module.exports = router;