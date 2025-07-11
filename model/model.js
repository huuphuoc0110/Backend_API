//Khai báo model của database
const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    name: { type: String, required: true,},
    birth: {type: String},    
    phone: {type: String, required: true},
    email: {type: String, required: true,},
    username: {type: String, required: true},
    password: {type: String, required: true},
    gatewayId: [{type: mongoose.Schema.Types.ObjectId, ref: "Gateways" }],
    avatar: {type: String}, 
    home: {type: String},
    id: {type: String}
});

const gatewaysSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: "Users"},
    projectName: {type: String},
    gatewayName: {type: String},
    gatewayAddress: {type: String,},
    gatewayCreatedDay: {type: String},
    nodeId: [{type: mongoose.Schema.Types.ObjectId, ref: "Node"}],
    id: {type: String}
});

const nodeSchema = new mongoose.Schema({
    name: {type: String},
    gatewayId: {type: mongoose.Schema.Types.ObjectId,ref: "Gateways"},
    nodePosition: {type: String,},
    nodeCreatedDay: {type: String},
    nodeAddh: {type: String, required: true},
    nodeAddl: {type: String, required: true},
    nodeDesc: {type: String},
    nodeAddress: {type: String},
    id: {type: String},
    duration: { type: Number, default: 5 },
    gatewayName: {type: String}
});

const newGatewaySchema = new mongoose.Schema({
    id: {
        type: String,
        default: function () {
            return this._id.toString();
        }
    },
    wifiName: String,
    gatewayMac: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 }, // TTL 60 giây
    },
});

const deviceSchema = new mongoose.Schema({
    id: {type: String},
    gatewayId: {type: mongoose.Schema.Types.ObjectId,ref: "Gateways"},
    nodeId: {type: mongoose.Schema.Types.ObjectId,ref: "Node"},
    name:{type: String},
    pin:{type: String},
    description:{type: String},
    status:{type: Boolean},
    defaultStatus: { type: Boolean, default: undefined },
    conditionFlag:{type: Boolean, default: false},
});

const schedulesSchema = new mongoose.Schema({
    id:{type: String},
    gatewayId: {type: mongoose.Schema.Types.ObjectId,ref: "Gateways"},
    nodeId: {type: mongoose.Schema.Types.ObjectId,ref: "Node"},
    deviceName:{type: String},
    devicePin:{type: String},
    dailyRepeat:{type: Boolean},
    status:{type: Boolean},
    startTime:{type: String},
});


const sensorSchema = new mongoose.Schema({
    id:{type: String},
    gatewayId: {type: mongoose.Schema.Types.ObjectId,ref: "Gateways"},
    nodeId: {type: mongoose.Schema.Types.ObjectId,ref: "Node"},
    sensorType: {type: String},
    data:        
        {
            today: {
                dataMinute: [{
                    time: { type: Date },   
                    value: { type: Number }
                }],
                dataHour: [{
                    time: { type: Date },
                    value: { type: Number }
                }]
            },

            pastDay: [{
                date: { type: Date },       
                dataMinute: [{
                    time: { type: Date },
                    value: { type: Number }
                }],
                dataHour: [{
                    time: { type: Date },
                    value: { type: Number }
                }]
            }]
        }
});

const conditionsSchema = new mongoose.Schema({
    id: {type: String},
    gatewayId: {type: mongoose.Schema.Types.ObjectId,ref: "Gateways"},
    nodeId: {type: mongoose.Schema.Types.ObjectId,ref: "Node"},
    deviceName:{type: String, require: true},
    devicePin:{type: String, require: true},
    description:{type: String},
    status:{type: Boolean},
    sensorType:{type: Number},
    minValue:{type: Number},
    maxValue:{type: Number}
});

const notifySchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: "Users"},
    type: {type: Boolean},
    data: {type: String},
    id: {type: String},
    createAt:{type: Date, default: Date.now}
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
conditionsSchema.pre('save', function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});
notifySchema.pre('save', function (next) {
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
let Conditions = mongoose.model("Conditions", conditionsSchema);
let Notify = mongoose.model("Notify", notifySchema);

module.exports = { Users, Gateways, Node, newGateway, Sensors, Devices, Schedules, Conditions, Notify}; 

