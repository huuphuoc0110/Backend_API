//Chứa các route API như post, get,..
const devicesController = require("../controller/devicesController");

const router = require("express").Router();


router.post("/", devicesController.addDevice);

//Find gateways
router.get("/", devicesController.findDevice);


//Replace gateways
router.patch("/:id", devicesController.updateDevice);

//Delete gateways
router.delete("/:id", devicesController.deleteDevice);

module.exports = router;