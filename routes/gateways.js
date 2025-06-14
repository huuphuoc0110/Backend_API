//Chứa các route API như post, get,..
const gatewaysController = require("../controller/gatewaysController");
const verifyApiKey = require('../middleware/verifyApiKey'); // KHÔNG sai đường dẫn
const router = require("express").Router();

//Add gateway
router.post("/", verifyApiKey,gatewaysController.addGateways);

//Find gateways
router.get("/", verifyApiKey, gatewaysController.getAllGateways);

//Find gateways by ID
 router.get("/:id", verifyApiKey, gatewaysController.findAnGateway)
//Replace gateways
router.patch("/:id", verifyApiKey, gatewaysController.updateGateways);

//Delete gateways
router.delete("/:id", verifyApiKey, gatewaysController.deleteGateways);

module.exports = router;