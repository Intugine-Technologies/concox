const app = require('express')();
const mongo = require('@intugine-technologies/mongodb');
const body_parser = require('body-parser');
const logger = require('pino')().child({ source: 'CONCOX_SERVER_API' });
app.use(body_parser.json());
let db = null;
const config = require('../config');
app.get('/concox/last_location/:imei', (req, res) => {
	db.read('status', {imei: req.params.imei, gps: {$exists: true}})
		.then((r) => {
			res.json(r[0]);
		})
		.catch((e) => {
			logger.error({method: 'GET', event: '/concox/last_location/:imei', err: e});
			res.sendStatus(500);
		});
});

app.post('/concox/data', (req, res) => {
	db.create('status', req.body.data)
		.then((r) => {
			res.sendStatus(200);
		})
		.catch((e) => {
			logger.error({method: 'POST', event: '/concox/data', err: e});
			res.sendStatus(500);
		});
});

app.post('/concox/invalid_data', (req, res) => {
	db.create('invalid_status', req.body)
		.then((r) => {
			res.sendStatus(200);
		})
		.catch((e) => {
			logger.error({method: 'POST', event: '/concox/invalid_data', err: e});
			res.sendStatus(500);
		});
});

app.get('/concox/invalid_data', (req, res) => {
	const limit = req.query.limit === 'all' ? 'all' : parseInt(req.query.limit || 10);
	db.read('invalid_status', {}, limit)
		.then((r) => {
			res.json(r);
		})
		.catch((e) => {
			logger.error({method: 'GET', event: '/concox/invalid_data', err: e});
			res.sendStatus(500);
		});
});

app.get('/concox/device/:imei',(req, res) => {
	db.read('devices', {imei: req.params.imei})
		.then((r) => {
			res.json(r[0]);
		})
		.catch((e) => {
			logger.error({method: 'GET', event: '/concox/device/:imei', err: e});
			res.sendStatus(500);
		});
});

app.get('/concox/', (req, res) => {
	const limit = req.query.limit === 'all' ? 'all' : parseInt(req.query.limit || 10);
	db.read('status', {}, limit)
		.then((r) => {
			res.json(r);
		})
		.catch((e) => {
			logger.error({method: 'GET', event: '/concox/', err: e});
			res.sendStatus(500);
		});
});

mongo(config.DB_URI, config.DB_NAME)
	.then((DB) => {
		db = DB;
		app.listen(config.CONCOX_API_PORT, () => {
			logger.error({event: 'CONCOX_SERVER_API STARTED', PORT: config.CONCOX_API_PORT});
		});
	})
	.catch((e) => {
		logger.error({event: 'ERROR CONNECTING TO DB', err: e});
	});