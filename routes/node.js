
const nodeController = require("../controller/nodeController");
const verifyApiKey = require('../middleware/verifyApiKey'); // KHÔNG sai đường dẫn
const router = require("express").Router();

//Thêm node
router.post("/", verifyApiKey, nodeController.addNode);

//Get nhiều node và tìm node theo id gateways
router.get("/", verifyApiKey, nodeController.getAllNode);

router.get("/:id", verifyApiKey, nodeController.getNodeId);

//Xóa node lẫn id node trong gateways
router.delete("/:id", verifyApiKey, nodeController.deleteNode);

//Thay đổi thông tin qua id node
router.patch("/:id", verifyApiKey, nodeController.updateNode);

module.exports = router;