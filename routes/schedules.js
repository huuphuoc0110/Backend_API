
const schedulesController = require("../controller/schedulesController");
const verifyApiKey = require('../middleware/verifyApiKey'); // KHÔNG sai đường dẫn
const router = require("express").Router();


router.post("/", verifyApiKey,schedulesController.addSchedules);

//Find gateways
router.get("/", verifyApiKey, schedulesController.findSchedules);


//Replace gateways
router.patch("/:id", verifyApiKey, schedulesController.updateSchedules);

//Delete gateways
router.delete("/:id", verifyApiKey, schedulesController.deleteSchedules);

module.exports = router;