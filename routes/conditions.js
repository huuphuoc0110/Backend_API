//Chứa các route API như post, verifyApiKey, get, verifyApiKey,..
const conditionsController = require("../controller/conditionsController");
const verifyApiKey = require('../middleware/verifyApiKey'); // KHÔNG sai đường dẫn
const router = require("express").Router();


router.post("/", verifyApiKey, conditionsController.addConditions);

//Find gateways
router.get("/", verifyApiKey, conditionsController.findCondition);

//Replace gateways
router.patch("/:id", verifyApiKey, conditionsController.updateConditions);

//Delete gateways
router.delete("/:id", verifyApiKey, conditionsController.deleteConditions);

module.exports = router;