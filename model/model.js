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
    gatewayId: [{
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

const gatewaysSchema = new mongoose.Schema({
    userId:
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
    },
    nodeId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node"
    }],
    id: {
        type: String
    }
});

const nodeSchema = new mongoose.Schema({
    gatewayId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gateways"
    },
    name: 
    {
        type: String,
        require: true
    },
    nodePosition:
    {
        type: String,
        require: true
    },
    nodeCreatedDay:
    {
        type: String,
        require: true
    },
    nodeAddh:
    {
        type: String,
        require: true
    },
    nodeAddl:
    {
        type: String,
        require: true
    },
    nodeDesc: {
        type: String,
        require: true
    },
    nodeAddress: {
        type: String,
        require: true
    },
    id: {
        type: String
    }
})

//Copy id tu truong _id
usersSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});

gatewaysSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});

nodeSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});

let Users = mongoose.model("Users", usersSchema);
let Gateways = mongoose.model("Gateways", gatewaysSchema);
let Node = mongoose.model("Node", nodeSchema);

module.exports = { Users, Gateways, Node }; 