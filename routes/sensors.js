//Chứa các route API như post, get,..
const sensorsController = require("../controller/sensorsController.js");
const usersController = require("../controller/sensorsController.js");

const router = require("express").Router();

router.post("/", sensorsController.addSensor);

//Get nhiều node và tìm node theo id gateways
router.get("/:id", sensorsController.findASensor);

router.get("/", sensorsController.findSensorByNode);

router.delete("/:id", sensorsController.deleteSensor);

module.exports = router;