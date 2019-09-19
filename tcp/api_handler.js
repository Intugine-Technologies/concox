const axios = require('axios');
const config = require("../config");
module.exports = axios.create({
	baseURL: `http://localhost:${config.CONCOX_API_PORT}/concox/`,
	timeout: 10000
});