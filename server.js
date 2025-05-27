//Chứa chương trình chính
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
const usersRoute = require("./routes/users");
const gatewaysRoute = require("./routes/gateways");
const nodeRoute = require("./routes/node");

dotenv.config();

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});


app.use(bodyParser.json({limit:"50mb"}));
app.use(cors());
app.use(morgan("common"));

//Connect database


app.get("/api", (req,res) =>{
    res.status(200).json("Hello");
})
app.get("/", (req, res) => {
    res.send("Server is running!");
});

//ROUTES
app.use("/v1/users", usersRoute);
app.use("/v1/gateways", gatewaysRoute);
app.use("/v1/node", nodeRoute);


app.listen(8000, () => {
    console.log("Server is running");
})