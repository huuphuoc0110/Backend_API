
const usersController = require("../controller/usersController");

const router = require("express").Router();

//Add user
router.post("/", verifyApiKey, usersController.addUsers);

//Find user
router.get("/", verifyApiKey, usersController.getAllUsers);

//Find an users
router.get("/:id", verifyApiKey, usersController.findAnUsers);

router.patch("/:id", verifyApiKey, usersController.updateUsers);


module.exports = router;