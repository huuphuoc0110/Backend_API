//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Gateways, Users, Node, newGateway } = require("../model/model");

const newGatewayController = {

    getNewGateways: async (req, res) => {
        try {
            const newGateways = await newGateway.find()
            res.status(200).json(newGateways);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    updateGateways: async (req, res) => {
        try {
            const newGateways = await newGateway.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.status(200).json(newGateways);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },




};

module.exports = newGatewayController;