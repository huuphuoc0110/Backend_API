//Chứa các route API như post, get,..
const newGatewayController = require("../controller/newGatewayController");

const router = require("express").Router();

//Find gateways
router.get("/", newGatewayController.getNewGateways);

//Replace gateways
router.patch("/:_id", newGatewayController.updateGateways);

module.exports = router;