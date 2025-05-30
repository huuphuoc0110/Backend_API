//Chứa các route API như post, get,..
const schedulesController = require("../controller/schedulesController");

const router = require("express").Router();


router.post("/",schedulesController.addSchedules);

//Find gateways
router.get("/", schedulesController.findSchedules);


//Replace gateways
router.patch("/:id", schedulesController.updateSchedules);

//Delete gateways
router.delete("/:id", schedulesController.deleteSchedules);

module.exports = router;