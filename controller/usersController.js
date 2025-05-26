//Controller sẽ ghi chi tiết response lại những gì khi api được gọi

const { Users, Gateways } = require("../model/model");
const bcrypt = require('bcrypt'); // Thêm bcrypt nếu mật khẩu được băm

const usersController = {
    //Add user
    addUsers: async (req, res) => {
        try {
            const newUsers = new Users(req.body);
            const saveUsers = await newUsers.save();
            res.status(200).json(saveUsers);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
        // res.status(200).json(req.body);
    },
    getAllUsers: async (req, res) => {
        try {
            const { username, password, email, _id } = req.query;
            let users = [];

            if (username && password) {
                const user = await Users.findOne({ username, password });
                if (user) users.push(user); // thêm vào mảng nếu có
            } else if (email) {
                const user = await Users.findOne({ email });
                if (user) users.push(user);
            } else {
                users = await Users.find().populate('gateways'); // trả về mảng luôn
            }

            res.status(200).json(users); // luôn là mảng []
        } catch (err) {
            res.status(500).json({ message: 'Lỗi server', error: err.message });
        }
    },


    updateUsers: async (req, res) => {
        try {
            const users = await Users.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
            // await users.updateOne({$set: req.body}, { new: true });
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
    findAnUsers: async (req, res) => {
        try {
            const users = await Users.findOne({ _id: req.params.id });
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json(err); //HTTP request code
        };
    },
};

module.exports = usersController;