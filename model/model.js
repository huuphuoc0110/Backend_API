//Khai báo model của database
const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    birth: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    gateways: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gateways"
    }],
    avatar: {
        type: String,
    },
    home: {
        type: String,
    },
    id: { 
        type: String
    }
});

usersSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});

const gatewaysSchema = new mongoose.Schema({
    users:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    projectName: {
        type: String,
        require: true
    },
    gatewayName: {
        type: String,
        require: true
    },
    gatewayAddress: {
        type: String,
        require: true
    },
    gatewayCreateDay: {
        type: String,
        require: true
    }
})

let Users = mongoose.model("Users", usersSchema);
let Gateways = mongoose.model("Gateways", gatewaysSchema);

module.exports = { Users, Gateways }; 