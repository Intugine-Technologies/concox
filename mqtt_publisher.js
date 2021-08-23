const config = require('./config.json');
const client = require("mqtt").connect(config.BROKER_URL, {
    clientId: config.MQTT_CLIENT_ID,
    username: config.MQTT_USERNAME,
    password: config.MQTT_PASSWORD
});
client.on("connect", function () {
    console.log("Connected to Broker");
});
module.exports = client;