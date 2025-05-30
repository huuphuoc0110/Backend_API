//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Sensors, Gateways, Node } = require("../model/model");

const sensorsController = {

    addSensor: async (req, res) => {
        try {
            const newSensor = new Sensors(req.body);
            const saveSensor = await newSensor.save();
            res.status(200).json(saveSensor);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
    findSensorByNode: async (req, res) => { 
        try {
            const { nodeId } = req.query;

            let sensors = [];

            if ( nodeId ) {
                sensors = await Sensors.find({ nodeId });
            } else {
                sensors = await Sensors.find()
            }
            res.status(200).json(sensors);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
    findASensor: async (req, res) => { 
        try {
            const sensors = await Sensors.findById(req.params.id);
            res.status(200).json(sensors);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    deleteSensor: async (req, res) => { // Xóa gateway và xóa trong users
        try {
            await Sensors.findByIdAndDelete(req.params.id);
            res.status(200).json("Delete succesfully");
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
 
};

module.exports = sensorsController;