//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Devices } = require("../model/model");

const devicesController = {

    addDevice: async (req, res) => {
        try {
            const newDevice = new Devices(req.body);
            const saveDevice = await newDevice.save();
            res.status(200).json(saveDevice);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    findDevice: async (req, res) => {
        try {
            const { nodeId } = req.query;
            let device = [];
            if (nodeId) {
                device = await Devices.find({ nodeId });
            } else {
                device = await Devices.find();
            }
            res.status(200).json(device);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    deleteDevice: async (req, res) => {
        try {
            await Devices.findByIdAndDelete(req.params.id);
            res.status(200).json("Delete succesfully");
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
    updateDevice: async (req, res) => {
        try {
            const devices = await Devices.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.status(200).json(devices);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    }

};

module.exports = devicesController;