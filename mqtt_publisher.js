const config = require('./config.json');
const client = require("mqtt").connect(config.BROKER_URL);
client.on("connect", function () {
    console.log("Connected to Broker");
});
module.exports = client;