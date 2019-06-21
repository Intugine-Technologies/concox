const server = require("net").createServer();
const axios = require("axios");
const logger = require("pino")().child({ source: "CONCOX_TCP_SERVER" });
const parser = require("./parser");
const config = require("../config");
const mqtt_publisher = require("../mqtt_publisher");

const terminals_connected = [];
const API_BASE = `http://localhost:${config.CONCOX_API_PORT}/concox`;
const devices_data = {};
const fs = require('fs');
const devices = {
  set: data => {
    if (data) devices_data[data.imei] = { ...devices_data[data.imei], ...data };
  },
  get: imei =>
    new Promise((resolve, reject) => {
      if (devices_data[imei]) resolve(devices_data[imei]);
      else {
        console.log("Network get called", imei);
        axios({ url: `${API_BASE}/device/${imei}` })
          .then(r => {
            devices_data[imei] = {
              ...devices_data[imei],
              id: r.data && r.data.id ? r.data.id : "NA",
              client: r.data ? r.data.client : null
            };
            resolve(devices_data[imei]);
          })
          .catch(e => {
            reject(e);
          });
      }
    })
};

server.on("connection", socket => {
  socket.setEncoding("hex");
  const client = `${socket.remoteAddress}:${socket.remotePort}`;
  logger.info({ event: "connection", client });
  socket.on("data", data => {
    let parsed = parser(data);
    if (parsed && parsed.length > 0) {
      let imei = null;
      if (parsed[0].case === "01") {
        const index = terminals_connected.findIndex(
          k => k.imei === parsed[0].imei
        );
        if (index === -1) {
          terminals_connected.push({
            imei: parsed[0].imei,
            remoteAddress: socket.remoteAddress
          });
          imei = parsed[0].imei;
        } else {
          terminals_connected[index].remoteAddress = socket.remoteAddress;
          imei = terminals_connected[index].imei;
        }
      } else {
        imei = (
          terminals_connected.find(
            k => k.remoteAddress === socket.remoteAddress
          ) || { imei: null }
        ).imei;
        parsed = parsed.map(k => Object.assign({}, k, { imei }));
      }
      data_middleware(parsed);
      if (parsed[0].output)
        socket.write(
          Buffer.from(parsed[0].output.match(/.{2}/g).map(i => parseInt(i, 16)))
        );
    } else send_invalid_data_to_api(data);
  });
  socket.on("error", err => {
    logger.error({ event: "error", err, client });
  });
  socket.on("close", () => {
    const index = terminals_connected.findIndex(
      k => k.remoteAddress === socket.remoteAddress
    );
    if (index > -1) terminals_connected.splice(index, 1);
    logger.info({ event: "close", client });
  });
  socket.on("end", () => {
    const index = terminals_connected.findIndex(
      k => k.remoteAddress === socket.remoteAddress
    );
    if (index > -1) terminals_connected.splice(index, 1);
    logger.info({ event: "end", client });
  });
});
server.on("error", err => {
  logger.error({ event: "Server error", err });
});
server.on("close", err => {
  logger.log({ event: "Server close", err });

});
process.on("unhandledRejection", (reason, promise) => {
  logger.error({
    event: "Unhandled Rejection at:",
    err: reason.stack.toString() || reason
  });
});

const data_middleware = data => {
  let client = null;
  if (data[0].imei) {
    devices
      .get(data[0].imei)
      .then(r => {
        client = r.client;
        send_data_to_api(
          data.map(k => ({
            ...k,
            device: r.id,
            client: r.client,
            battery: k.battery || r.battery
          })),
          client
        );
      })
      .catch(e => {
        console.error(e);
      });
  }
  return;
};

const send_data_to_api = (data, client) => {
  devices.set({...data[0]});
  if (client && data[0].gps) {
    mqtt_publisher.publish(client, JSON.stringify(data));
  }
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

const send_invalid_data_to_api = data => {
  axios({
    url: `${API_BASE}/invalid_data`,
    method: "POST",
    data: { data }
  })
    .then(r => {
      logger.info({ event: "Invalid Data Sent to API", imei: data[0].imei });
    })
    .catch(e => {
      logger.error({
        event: "Invalid Data Error Sending to API",
        data,
        err: e.response.data
      });
    });
  return;
};
server.listen(config.CONCOX_TCP_PORT, () => {
  logger.error({
    event: "CONCOX_TCP_SERVER STARTED",
    PORT: config.CONCOX_TCP_PORT
  });
});