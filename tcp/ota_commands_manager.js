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
	add: (imei, data) => {
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
	members: () => {
		return new Promise((resolve, reject) => {
			redis_client.smembers("ota_commands", (err, data) => {
				if(err) {console.error(err); resolve([])}
				else resolve(data.map(k => JSON.parse(k)))
			});
		});
	},
	remove: (data) => {
		return new Promise((resolve, reject) => {
			redis_client.srem("ota_commands", JSON.stringify(data), (err, res) => {
				if(err) {console.error(err); resolve(false)}
				else resolve(true);
			});
		});
	}
};