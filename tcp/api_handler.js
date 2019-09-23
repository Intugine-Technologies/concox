const axios = require('axios');
const http = require('http');
const https = require('https');
const config = require("../config");
module.exports = axios.create({
	baseURL: `http://127.0.0.1:${config.CONCOX_API_PORT}/concox/`,
	timeout: 60000,
	httpAgent: new http.Agent({ keepAlive: true }),
	httpsAgent: new https.Agent({ keepAlive: true }),
	maxRedirects: 10,
	maxContentLength: 1 * 1000 * 1000
});