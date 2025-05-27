//Chứa các route API như post, get,..
const nodeController = require("../controller/nodeController");

const router = require("express").Router();

//Thêm node
router.post("/", nodeController.addNode);

//Get nhiều node và tìm node theo id gateways
router.get("/", nodeController.getAllNode);

//Xóa node lẫn id node trong gateways
router.delete("/:id", nodeController.deleteNode);

//Thay đổi thông tin qua id node
router.patch("/:id", nodeController.updateNode);

module.exports = router;