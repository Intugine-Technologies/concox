const axios = require('axios');
const Agent = require('agentkeepalive');
const keepAliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 10000,
  freeSocketTimeout: 30000,
});
const config = require("../config");
module.exports = axios.create({
	baseURL: `http://127.0.0.1:${config.CONCOX_API_PORT}/concox/`,
	timeout: 10000,
	httpAgent: keepAliveAgent,
});