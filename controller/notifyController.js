//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Gateways, Users, Node, newGateway, Notify } = require("../model/model");

const notifyController = {

    getNotify: async (req, res) => {
        try {
            const { userId } = req.query;
            const notify = await Notify.find({userId});
            res.status(200).json(notify);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

    deleteNotify: async (req, res) => {
        try {
            const { userId } = req.query;
            await Notify.deleteMany({ userId });
            res.status(200).json("Delete succesfully");
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },

};

module.exports = notifyController;