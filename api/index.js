const app = require('express')();
const mongo = require('@intugine-technologies/mongodb');
const body_parser = require('body-parser');
const moment = require('moment');
app.use(body_parser.json());
let db = null;
const config = require('../config');

app.get('/concox/last_location/:imei', (req, res) => {
    // db.read('status', { imei: req.params.imei, gps: { $exists: true } })
    db.read('status_v2', {
        imei: req.params.imei
    }, {
        events: {
            $slice: -1
        }
    })
        .then((r) => {
            if(r.length && r[0].events.length) res.json(r[0].events[0]);
            else res.json(null);
        })
        .catch((e) => {
            console.error({ method: 'GET', event: '/concox/last_location/:imei', err: e });
            res.sendStatus(500);
        });
});

app.get('/concox/last_battery/:imei', (req, res) => {
     db.read('status_v2', {
        imei: req.params.imei
    }, {
        events: {
            $slice: -1
        }
    })
        .then((r) => {
            if(r.length && r[0].events.length) res.json(r[0].events[0]);
            else res.json(null);
        })
        .catch((e) => {
            console.error({ method: 'GET', event: '/concox/last_battery/:imei', err: e });
            res.sendStatus(500);
        })
});

app.post('/concox/data', (req, res) => {
    // Promise.all([
        // db.create('status', req.body.data),
    // ])
        db.update('status_v2', {
            imei: req.body.data[0].imei,
            hour_window: moment().format('YYYY-MM-DDTHH')
        }, {
            $push: {
                events: {
                    $each: req.body.data.map(k => ({...k, createdAt: new Date()}))
                }
            }
        }, {
            upsert: true
        })
        .then((r) => {
            res.sendStatus(200);
        })
        .catch((e) => {
            console.error({ method: 'POST', event: '/concox/data', err: e });
            res.sendStatus(500);
        });
});

app.post('/concox/invalid_data', (req, res) => {
    db.create('invalid_status', req.body)
        .then((r) => {
            res.sendStatus(200);
        })
        .catch((e) => {
            console.error({ method: 'POST', event: '/concox/invalid_data', err: e });
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
            console.error({ method: 'GET', event: '/concox/invalid_data', err: e });
            res.sendStatus(500);
        });
});

app.get('/concox/devices/', (req, res, next) => {
    db.read('devices', {}, 'all')
        .then((r) => {
            res.json(r);
        })
        .catch((e) => {
            res.sendStatus(500);
        })
});

app.get('/concox/device/:imei', (req, res) => {
    db.read('devices', { imei: req.params.imei })
        .then((r) => {
            res.json(r[0]);
        })
        .catch((e) => {
            console.error({ method: 'GET', event: '/concox/device/:imei', err: e });
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
            console.error({ method: 'GET', event: '/concox/', err: e });
            res.sendStatus(500);
        });
});

mongo(config.DB_URI, config.DB_NAME)
    .then((DB) => {
        db = DB;
        app.listen(config.CONCOX_API_PORT, () => {
            console.log({ event: 'CONCOX_SERVER_API STARTED', PORT: config.CONCOX_API_PORT });
            process.send('ready');
        });
    })
    .catch((e) => {
        console.error({ event: 'ERROR CONNECTING TO DB', err: e });
    });

process.on("unhandledRejection", (reason, promise) => {
    console.error({
        event: "Unhandled Rejection at:",
        err: reason.stack ? reason.stack.toString() : reason
    });
});

process.on('SIGINT', function() {
    if (db) {
        setTimeout(() => {
            db.close();
            setTimout(() => {
                process.exit(0);
            }, 100);
        }, 100);
    }
});