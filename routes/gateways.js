//Chứa các route API như post, get,..
const gatewaysController = require("../controller/gatewaysController");

const router = require("express").Router();

//Add gateway
router.post("/", gatewaysController.addGateways);

//Find gateways
router.get("/", gatewaysController.getAllGateways);

//Replace gateways
router.patch("/:id", gatewaysController.updateGateways);

//Delete gateways
router.delete("/:id", gatewaysController.deleteGateways);

module.exports = router;