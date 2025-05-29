//Khai báo model của database
const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        requiredd: true,
    },
    birth: {
        type: String,
        requiredd: true,
    },
    phone: {
        type: String,
        requiredd: true,
    },
    email: {
        type: String,
        requiredd: true,
    },
    username: {
        type: String,
        requiredd: true,
    },
    password: {
        type: String,
        requiredd: true,
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
    userID:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    projectName: {
        type: String,
        required: true
    },
    gatewayName: {
        type: String,
        required: true
    },
    gatewayAddress: {
        type: String,
        required: true
    },
    gatewayCreateDay: {
        type: String,
        required: true
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
        required: true
    },
    nodePosition:
    {
        type: String,
        required: true
    },
    nodeCreatedDay:
    {
        type: String,
        required: true
    },
    nodeAddh:
    {
        type: String,
        required: true
    },
    nodeAddl:
    {
        type: String,
        required: true
    },
    nodeDesc: {
        type: String,
        required: true
    },
    nodeAddress: {
        type: String,
        required: true
    },
    id: {
        type: String
    }
});
const newGatewaySchema = new mongoose.Schema({
    wifiName: {
        type: String,
        required: true
    },
    gatewayMac: {
        type: String,
        required: true
    },
    id: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 600 }  // TTL index: tự động xóa sau 60 giây
    },
});

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

newGatewaySchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});

let Users = mongoose.model("Users", usersSchema);
let Gateways = mongoose.model("Gateways", gatewaysSchema);
let Node = mongoose.model("Node", nodeSchema);
let newGateway = mongoose.model("newGateway", newGatewaySchema);

module.exports = { Users, Gateways, Node, newGateway }; 