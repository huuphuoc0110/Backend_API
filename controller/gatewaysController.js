//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Gateways, Users, Node } = require("../model/model");

const gatewaysController = {

    //Add gateways
    addGateways: async (req, res) => {
        try {
            const newGateways = new Gateways(req.body);
            const saveGateways = await newGateways.save();
            if (req.body.userId) {
                const users = Users.findById(req.body.userId);
                await users.updateOne({ $push: { gatewayId: saveGateways._id } });
            }
            res.status(200).json(saveGateways);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    getAllGateways: async (req, res) => {
        try {
            const { users } = req.query;

            let gateways = [];

            if ( users ) {
                gateways = await Gateways.find({ users });
            } else {
                gateways = await Gateways.find()
            }
            res.status(200).json(gateways);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    updateGateways: async (req, res) => {
        try {
            const gateways = await Gateways.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            // await users.updateOne({$set: req.body}, { new: true });
            res.status(200).json(gateways);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    deleteGateways: async (req, res) => { // Xóa gateway và xóa trong users
        try {
            await Users.updateMany(
                { gateways: req.params.id },
                { $pull: { gateways: req.params.id } }
            );
            await Gateways.findByIdAndDelete(req.params.id);
            res.status(200).json("Delete succesfully");
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
    findAnGateway: async (req, res) => { 
        try {
            const gateways = await Gateways.findById(req.params.id);
            res.status(200).json(gateways);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },


};

module.exports = gatewaysController;