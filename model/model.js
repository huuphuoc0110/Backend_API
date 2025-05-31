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
    gatewayCreatedDay: {
        type: String
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

const deviceSchema = new mongoose.Schema({
    id:
    {
        type: String
    },
    gatewayId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gateways"
    },
    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node"
    },
    name:
    {
        type: String,
        required: true        
    },
    pin:
    {
        type: String,
        required: true             
    },
    description:
    {
        type: String
    },
    status:
    {
        type: Boolean,
        required: true   
    }
});
const schedulesSchema = new mongoose.Schema({
    id:
    {
        type: String
    },
    gatewayId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gateways"
    },
    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node"
    },
    deviceName:
    {
        type: String,
        required: true        
    },
    devicePin:
    {
        type: String,
        required: true             
    },
    dailyRepeat:
    {
        type: Boolean,
        required: true  
    },
    status:
    {
        type: Boolean,
        required: true   
    },
    startTime:
    {
        type: Date
    },
    endTime:
    {
        type: Date
    },
});
const sensorSchema = new mongoose.Schema({
    id:
    {
        type: String
    },
    gatewayId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gateways"
    },
    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Node"
    },

    sensorType: {
        type: String,
        required: true
    },
    data:
    [{
        today: {
            dataMinute: [{
                time: { type: String },   // hoặc Date cho chuẩn
                value: { type: String }
            }],
            dataHour: [{
                time: { type: String },
                value: { type: String }
            }]
        },

        pastDay: [{
            date: { type: String },       // hoặc Date cho chuẩn
            dataMinute: [{
                time: { type: String },
                value: { type: String }
            }],
            dataHour: [{
                time: { type: String },
                value: { type: String }
            }]
        }]
    }]

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

sensorSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});
deviceSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});
schedulesSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});



let Users = mongoose.model("Users", usersSchema);
let Gateways = mongoose.model("Gateways", gatewaysSchema);
let Node = mongoose.model("Node", nodeSchema);
let newGateway = mongoose.model("newGateway", newGatewaySchema);
let Sensors = mongoose.model("Sensors", sensorSchema);
let Devices = mongoose.model("Devices", deviceSchema);
let Schedules = mongoose.model("Schedules", schedulesSchema);

module.exports = { Users, Gateways, Node, newGateway, Sensors, Devices, Schedules }; 