
const sensorsController = require("../controller/sensorsController.js");
const usersController = require("../controller/sensorsController.js");

const router = require("express").Router();

router.post("/", verifyApiKey, sensorsController.addSensor);

//Get nhiều node và tìm node theo id gateways
router.get("/:id", verifyApiKey, sensorsController.findASensor);

router.get("/", verifyApiKey, sensorsController.findSensorByNode);

router.delete("/:id", verifyApiKey, sensorsController.deleteSensor);

module.exports = router;