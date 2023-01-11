const redis = require("redis");
const config = require("../config.json");
const redis_client = redis.createClient({
    url: config.REDIS_URI,
});

redis_client.on("error", (err) => {
    console.log("Redis Connection Error " + err);
});

(async () => {
    await redis_client.connect();
})();

module.exports = {
    get: (imei) => {
        return new Promise((resolve, reject) => {
            redis_client.spop(`ota_commands_${imei}`)
                .then((data) => {
                    resolve(data ? JSON.parse(data) : null);
                })
                .catch((err) => {
                    console.log("Error", err);
                    resolve(null);
                });
        });
    },
    add: (imei, data) => {
        return new Promise((resolve, reject) => {
            redis_client.sadd(
                    `ota_commands_${imei}`,
                    JSON.stringify(data))
                .then((data) => {
                    resolve(null);
                })
                .catch((err) => {
                    console.log("Error", err);
                    resolve(null);
                });
        });
    },
    members: () => {
        return new Promise((resolve, reject) => {
            redis_client.smembers("ota_commands")
                .then((data) => {
                    resolve(data.map(k => JSON.parse(k)))
                })
                .catch((err) => {
                    console.error(err);
                    resolve([]);
                })
        });
    },
    remove: (data) => {
        return new Promise((resolve, reject) => {
            redis_client.srem("ota_commands", JSON.stringify(data))
                .then((res) => {
                    resolve(true);
                })
                .catch((err) => {
                    console.error(err);
                    resolve(false);
                });
        });
    }
};