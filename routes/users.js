//Chứa các route API như post, get,..
const usersController = require("../controller/usersController");

const router = require("express").Router();

//Add user
router.post("/", usersController.addUsers);

//Find user
router.get("/", usersController.getAllUsers);

//Find an users
router.get("/:id", usersController.findAnUsers);

router.patch("/:id", usersController.updateUsers);


module.exports = router;