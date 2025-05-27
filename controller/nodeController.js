//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Gateways, Users, Node } = require("../model/model");

const nodeController = {

    addNode: async (req, res) => {
        try {
            const newNode = new Node(req.body);
            const saveNode = await newNode.save();
            if (req.body.gateways) { //Cap nhat lien ket giua gateway va users thong qua id cua users
                const node = Gateways.find({ _id: req.body.gateways });
                await node.updateOne({ $push: { node: saveNode._id } });
            }
            res.status(200).json(saveNode);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    getAllNode: async (req, res) => {
        try {
            const { gatewayId } = req.query;
            let node = [];
            if (gatewayId) {
                node = await Node.find({ gatewayId });
            } else {
                node = await Node.find();
            }
            res.status(200).json(node);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    deleteNode: async (req, res) => {
        try {
            await Gateways.updateMany(
                { node: req.params.id },
                { $pull: { node: req.params.id } }
            );
            await Node.findByIdAndDelete(req.params.id);
            res.status(200).json("Delete succesfully");
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
    updateNode: async (req, res) => {
        try {
            const node = await Node.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.status(200).json(node);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    }

};

module.exports = nodeController;