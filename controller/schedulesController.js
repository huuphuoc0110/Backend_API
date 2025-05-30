//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Schedules } = require("../model/model");

const schedulesController = {

    addSchedules: async (req, res) => {
        try {
            const newSchedules = new Schedules(req.body);
            const saveSchedules = await newSchedules.save();
            res.status(200).json(saveSchedules);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    findSchedules: async (req, res) => {
        try {
            const { nodeId } = req.query;
            let schedules = [];
            if (nodeId) {
                schedules = await Schedules.find({ nodeId });
            } else {
                schedules = await Schedules.find();
            }
            res.status(200).json(schedules);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    deleteSchedules: async (req, res) => {
        try {
            await Schedules.findByIdAndDelete(req.params.id);
            res.status(200).json("Delete succesfully");
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
    updateSchedules: async (req, res) => {
        try {
            const schedules = await Schedules.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.status(200).json(schedules);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    }

};

module.exports = schedulesController;