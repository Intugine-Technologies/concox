const redis = require("redis");
const config = require("../config.json");
const redis_client = redis.createClient({
	url: config.REDIS_URI,
});

redis_client.on("error", (err) => {
	console.log("Redis Connection Error " + err);
});

module.exports = {
	get: (imei) => {
		return new Promise((resolve, reject) => {
			redis_client.spop(`ota_commands_${imei}`, (err, data) => {
				if (err) {
					console.log("Error", err);
					resolve(null);
				} else resolve(data ? JSON.parse(data) : null);
			});
		});
	},
	add: (imei, command) => {
		return new Promise((resolve, reject) => {
			redis_client.sadd(
				`ota_commands_${imei}`,
				JSON.stringify(data),
				(err, data) => {
					if (err) {
						console.log("Error", err);
						resolve(null);
					} else resolve(null);
				}
			);
		});
	},
};