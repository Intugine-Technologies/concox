const terminals_connected = {};
module.exports = {
	set: (imei, remote_address, remote_port) => {
		const client = `${remote_address}:${remote_port}`;
		const prev_remote_address = Object.keys(terminals_connected).find(k => terminals_connected[k] === imei);
		delete terminals_connected[prev_remote_address];
		terminals_connected[client] = imei;
		return imei;
	},
	get: (remote_address, remote_port) => {
		const client = `${remote_address}:${remote_port}`;
		return terminals_connected[client] || null;
	},
	delete: (remote_address, remote_port) => {
		const client = `${remote_address}:${remote_port}`;
		delete terminals_connected[client];
	}
};