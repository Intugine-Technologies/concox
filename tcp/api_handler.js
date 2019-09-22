const axios = require('axios');
const http = require('http');
const config = require("../config");
module.exports = axios.create({
	baseURL: `http://127.0.0.1:${config.CONCOX_API_PORT}/concox/`,
	timeout: 10000,
	httpAgent: new http.Agent({keepAlive: true}),
});