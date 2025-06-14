
const sensorsController = require("../controller/sensorsController.js");

const verifyApiKey = require('../middleware/verifyApiKey'); // KHÔNG sai đường dẫn
const router = require("express").Router();

router.post("/", verifyApiKey, sensorsController.addSensor);

//Get nhiều node và tìm node theo id gateways
router.get("/:id", verifyApiKey, sensorsController.findASensor);

router.get("/", verifyApiKey, sensorsController.findSensorByNode);

router.delete("/:id", verifyApiKey, sensorsController.deleteSensor);

module.exports = router;