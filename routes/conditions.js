//Chứa các route API như post, get,..
const conditionsController = require("../controller/conditionsController");

const router = require("express").Router();


router.post("/", conditionsController.addConditions);

//Find gateways
router.get("/", conditionsController.findCondition);

//Replace gateways
router.patch("/:id", conditionsController.updateConditions);

//Delete gateways
router.delete("/:id", conditionsController.deleteConditions);

module.exports = router;