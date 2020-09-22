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
    redis_client.get(imei, (err, result) => {
        if (err) console.error(err);
        else {
            redis_client.set(imei, JSON.stringify({ ...JSON.parse(result), ...data }));
        }
    });
};

const obj = {
    set: data => {
        if (data) {
            update_redis(data.imei, data);
        }
    },
    get: imei =>
        new Promise((resolve, reject) => {
            api_handler({ url: `/device/${imei}` })
                .then(r => {
                    redis_client.get(imei, (err, result) => {
                        if (err) reject(err);
                        else {
                            resolve({
                                ...JSON.parse(result),
                                id: r.data && r.data.id ? r.data.id : "NA",
                                client: r.data ? r.data.client : null
                            });
                        }
                    });
                })
                .catch(e => {
                    reject(e);
                });
        })
};
module.exports = obj;