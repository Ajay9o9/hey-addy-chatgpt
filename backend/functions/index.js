const cors = require("cors");
const express = require("express");
const functions = require("firebase-functions");
const {apiAccessClientAddresses, EMAIL, PASSWORD} = require("./config/config");
const bodyParser = require("body-parser");

const api = express();

api.use(cors({
    origin: apiAccessClientAddresses,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));

api.use(bodyParser.json({limit: "50mb"}));
api.use(bodyParser.urlencoded({extended: true, limit: "50mb"}));
api.use(bodyParser.text({limit: "200mb"}));

api.get("/", async (request, response) => {
    response.status(200).json({success: true});
});
api.use("/thread", require("./routes/thread"));

exports.api = functions.https.onRequest(api);
