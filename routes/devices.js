
const devicesController = require("../controller/devicesController");

const router = require("express").Router();


router.post("/", verifyApiKey, devicesController.addDevice);

//Find gateways
router.get("/", verifyApiKey, devicesController.findDevice);


//Replace gateways
router.patch("/:id", verifyApiKey, devicesController.updateDevice);

//Delete gateways
router.delete("/:id", verifyApiKey, devicesController.deleteDevice);

module.exports = router;