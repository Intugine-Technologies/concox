const axios = require('axios');
const http = require('http');
const https = require('https');
const config = require("../config");
module.exports = axios.create({
	baseURL: `http://127.0.0.1:${config.CONCOX_API_PORT}/concox/`,
	timeout: 10000,
	httpAgent: new http.Agent({ keepAlive: true, maxSockets: 200, timeout: 10000 }),
	httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 200, timeout: 10000 }),
	maxRedirects: 10,
	maxContentLength: 1 * 1000 * 1000
});