//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Conditions } = require("../model/model");

const conditionsController = {

    addConditions: async (req, res) => {
        try {
            console.log("Received POST body:", req.body); // 🪵 in ra dữ liệu
            const newConditions = new Conditions(req.body);
            const saveCondtions = await newConditions.save();
            res.status(200).json(saveCondtions);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    findCondition: async (req, res) => {
        try {
            const { nodeId } = req.query;
            let conditions = [];
            if (nodeId) {
                conditions = await Conditions.find({ nodeId });
            } else {
                conditions = await Conditions.find();
            }
            res.status(200).json(conditions);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    deleteConditions: async (req, res) => {
        try {
            await Conditions.findByIdAndDelete(req.params.id);
            res.status(200).json("Delete succesfully");
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
    updateConditions: async (req, res) => {
        try {
            const conditions = await Conditions.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.status(200).json(conditions);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    }

};

module.exports = conditionsController;