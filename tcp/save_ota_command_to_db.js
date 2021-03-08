const api_handler = require("./api_handler.js");

module.exports = (data) => {
	api_handler({
		url: "/ota_command",
		data: {data},
		method: "POST"
	})
	.then((r) => {
		console.log('OTA Saved in DB', data[0].imei)
	})
	.catch((e) => {
		console.error("some error in saving to db, ota", e);
	});
};