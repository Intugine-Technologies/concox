const server = require('net').createServer();
const axios = require('axios');
const logger = require('pino')().child({ source: 'CONCOX_TCP_SERVER' });
const parser = require('./parser');
const config = require('../config');
const mqtt_publisher = require('../mqtt_publisher');

const terminals_connected = [];
const API_BASE = `http://localhost:${config.CONCOX_API_PORT}/concox`;
server.on('connection', (socket) => {
  socket.setEncoding('hex');
  const client = `${socket.remoteAddress}:${socket.remotePort}`;
  logger.info({ event: 'connection', client });
  socket.on('data', (data) => {
    logger.info({ event: 'data', data, client });
    let parsed = parser(data);
    if (parsed && parsed.length > 0) {
      let imei = null;
      if (parsed[0].case === '01') {
        const index = terminals_connected.findIndex(k => k.imei === parsed[0].imei);
        if (index === -1) {
          terminals_connected.push({ imei: parsed[0].imei, remoteAddress: socket.remoteAddress });
          imei = parsed[0].imei;
        } else {
          terminals_connected[index].remoteAddress = socket.remoteAddress;
          imei = terminals_connected[index].imei;
        }
      } else {
        imei = (terminals_connected.find(k => k.remoteAddress === socket.remoteAddress) || { imei: null }).imei;
        parsed = parsed.map(k => Object.assign({}, k, { imei }));
      }
      data_middleware(parsed);
      if (parsed[0].output) socket.write(Buffer.from(parsed[0].output.match(/.{2}/g).map(i => parseInt(i, 16))));
    } else send_invalid_data_to_api(data);
  });
  socket.on('error', (err) => {
    logger.error({ event: 'error', err, client });
  });
  socket.on('close', () => {
    logger.info({ event: 'close', client });
  });
  socket.on('end', () => {
    logger.info({ event: 'end', client });
  });
});
server.on('error', (err) => {
  logger.error({ event: 'Server error', err });
});
server.on('close', (err) => {
  logger.log({ event: 'Server close', err });
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ event: 'Unhandled Rejection at:', err: reason.stack.toString() || reason });
});
const data_middleware = (data) => {
  let client = null;
  if (data[0].imei) {
    get_device(data[0].imei)
      .then((r) => {
        client = r && r.data ? r.data.client : null;
        data = data.map(i => Object.assign({}, i, { device: (r && r.data ? r.data.id : 'NA') }));
        if (data[0].case === '01') send_data_to_api(data, client);
        else if (data[0].gps && data[0].battery) send_data_to_api(data, client);
        else {
          Promise.all([
              get_last_loc(data[0].imei),
              get_last_battery(data[0].imei)
            ])
            .then(r => {
              if (r && r[0] && r[0].data) {
                data = data.map(i => ({ ...i, gps: i.gps || r[0].data.gps }));
              } else {
                logger.info({ event: 'No Location Available', data });
              }
              if (r && r[1] && r[1].data) {
                data = data.map(i => ({ ...i, battery: i.battery || r[1].data.battery }));
              } else {
                logger.info({ event: 'No Battery Available', data });
              }
              send_data_to_api(data, client);
            }, e => {
              logger.error({ event: 'Error Fetching Last location', data, err: e.response.data });
            });
          // get_last_loc(data[0].imei)
          //   .then((r) => {
          //     if (r && r.data) {
          //       data = data.map(i => Object.assign({}, i, { gps: r.data.gps }));
          //     } else {
          //       logger.info({ event: 'No Location Available', data });
          //     }
          //     send_data_to_api(data, client);
          //   }, (e) => {
          //     logger.error({ event: 'Error Sending to API', data, err: e.response.data });
          //   });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
  return;
};
const get_last_loc = imei => axios({ url: `${API_BASE}/last_location/${imei}` });
const get_last_battery = imei => axios({ url: `${API_BASE}/last_battery/${imei}` });
const get_device = imei => axios({ url: `${API_BASE}/device/${imei}` });
const send_data_to_api = (data, client) => {
  if (client) mqtt_publisher.publish(client, JSON.stringify(data));
  axios({
      url: `${API_BASE}/data`,
      method: 'POST',
      data: { data }
    })
    .then((r) => {
      logger.info({ event: 'Sent to API', imei: data[0].imei });
    })
    .catch((e) => {
      logger.error({ event: 'Error Sending to API', data, err: e.response.data });
    });
  return;
};
const send_invalid_data_to_api = (data) => {
  axios({
      url: `${API_BASE}/invalid_data`,
      method: 'POST',
      data: { data }
    })
    .then((r) => {
      logger.info({ event: 'Invalid Data Sent to API', imei: data[0].imei });
    })
    .catch((e) => {
      logger.error({ event: 'Invalid Data Error Sending to API', data, err: e.response.data });
    });
  return;
};
server.listen(config.CONCOX_TCP_PORT, () => {
  logger.error({ event: 'CONCOX_TCP_SERVER STARTED', PORT: config.CONCOX_TCP_PORT });
});