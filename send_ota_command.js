const redis = require("redis");
const config = require("./config.json");
const redis_client = redis.createClient({
        url: config.REDIS_URI,
});

redis_client.on("error", (err) => {
        console.log("Redis Connection Error " + err);
});
const imei = "0353549091906452";
//const imei = "0860465040235776"
const data = {message_to_send: "MODE#", time: Date.now()}

redis_client.sadd(
                                `ota_commands_${imei}`,
                                JSON.stringify(data),
                                (err, data) => {
                                        if (err) {
                                                console.log("Error", err);
//                                              resolve(null);
                                        } else {console.log(data)};
                                }
                        );
