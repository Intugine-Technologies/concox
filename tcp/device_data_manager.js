const api_handler = require("./api_handler.js");
const redis = require("redis");
const config = require('../config.json');
const redis_client = redis.createClient({
    url: config.REDIS_URI
});

redis_client.on("error", (err) => {
    console.log("Redis Connection Error " + err);
});

const update_redis = (imei, data) => {
    console.log('update redis', imei, data);
    redis_client.get(imei)
        .then((result) => {
            redis_client.set(imei, JSON.stringify({ ...JSON.parse(result), ...data }));
        })
        .catch((err) => {
            console.error('Error', err);
        });
};


(async () => {
    await redis_client.connect();
})();
const obj = {
    set: data => {
        if (data) {
            update_redis(data.imei, data);
        }
    },
    get: imei =>
        new Promise((resolve, reject) => {
            let device = null;
            api_handler({ url: `/device/${imei}` })
                .then(r => {
                    device = r;
                    return redis_client.get(imei);
                })
                .then((result) => {
                    resolve({
                        ...JSON.parse(result || "{}"),
                        id: device.data && device.data.id ? device.data.id : "NA",
                        client: device.data ? device.data.client : null
                    });
                })
                .catch(e => {
                    reject(e);
                });
        })
};
module.exports = obj;