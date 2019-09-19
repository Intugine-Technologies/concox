const terminals_connected = {};
module.exports = {
	set: (imei, remote_address) => {
		const prev_remote_address = Object.keys(terminals_connected).find(k => terminals_connected[k] === imei);
		terminals_connected[prev_remote_address || remote_address] = imei;
		return imei;
	},
	get: (remote_address) => {
		return terminals_connected[remote_address] || null;
	},
	delete: (remote_address) => {
		delete terminals_connected[remote_address];
	}
};