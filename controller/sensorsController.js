//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Sensors, Gateways, Node } = require("../model/model");

const moment = require('moment-timezone');

function convertToVN(date) {
    return moment(date).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}

function formatSensorTime(sensor) {
    const obj = sensor.toObject();

    // Format today
    if (obj.data?.today) {
        obj.data.today.dataMinute = (obj.data.today.dataMinute || []).map(item => ({
            ...item,
            time: convertToVN(item.time)
        }));

        obj.data.today.dataHour = (obj.data.today.dataHour || []).map(item => ({
            ...item,
            time: convertToVN(item.time)
        }));
    }

    // Format pastDay
    obj.data.pastDay = (obj.data.pastDay || []).map(day => ({
        date: convertToVN(day.date),
        dataMinute: (day.dataMinute || []).map(item => ({
            ...item,
            time: convertToVN(item.time)
        })),
        dataHour: (day.dataHour || []).map(item => ({
            ...item,
            time: convertToVN(item.time)
        }))
    }));

    return obj;
}


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

            if (nodeId) {
                sensors = await Sensors.find({ nodeId });
            } else {
                sensors = await Sensors.find()
            }

            const formatted = sensors.map(formatSensorTime);
            res.status(200).json(formatted);
            // res.status(200).json(sensors);
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
    updateSensors: async (req, res) => {
        try {
            const sensors = await Sensors.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            res.status(200).json(sensors);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    }
};

module.exports = sensorsController;