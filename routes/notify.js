const notifyController = require("../controller/notifyController");
const verifyApiKey = require('../middleware/verifyApiKey'); // KHÔNG sai đường dẫn
const router = require("express").Router();

//Find gateways
router.get("/", verifyApiKey, notifyController.getNotify);

//Replace gateways
router.delete("/:id", verifyApiKey, notifyController.deleteNotify);

module.exports = router;