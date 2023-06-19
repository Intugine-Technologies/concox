const api_handler = require('./api_handler.js');
const imei_manager = require('./imei_manager.js');
const device_data_manager = require('./device_data_manager.js');
const mqtt_publisher = require("../mqtt_publisher");
const moment = require('moment');
const object__ = {
    imei_manager,
    device_data_manager,
    send_invalid_data_to_api: data => {
        api_handler({
                url: `/invalid_data`,
                method: "POST",
                data: data
            })
            .then(r => {
                console.info({ event: "Invalid Data Sent to API", data });
            })
            .catch(e => {
                console.error({
                    event: "Invalid Data Error Sending to API",
                    data,
                    err: e.response ? e.response.data : (e.code || e)
                });
            });
        return;
    },
    send_data_to_api: (data, client) => {
        if (client) {
            const __data = data.filter(k => k && k.time).map(k => ({
                ...k,
                time: moment().diff(moment(k.time)) > 0 ? k.time : new Date()
            }));

            if (__data.length) {
                if (__data[0].gps) {
                    device_data_manager.set(__data[0]);
                }
                if(Array.isArray(client)){
                    client.forEach((l) => {
                        mqtt_publisher.publish(l, JSON.stringify(__data));
                    });
                } else {
                    mqtt_publisher.publish(client, JSON.stringify(__data));
                }
            }
        }
        api_handler({
                url: `/data`,
                method: 'POST',
                data: { data }
            })
            .then((r) => {
                console.info({ event: 'Sent to API', imei: data[0].imei, time: new Date() });
            })
            .catch((e) => {
                console.error({ event: 'Error Sending to API', data, err: e.response ? e.response.data : (e.code || e) });
            });
        return;
    },
};

object__.data_middleware = data => {
    let client = null;
    if (data[0].imei) {
        device_data_manager
            .get(data[0].imei)
            .then(r => {
                client = r.client;
                console.log('data middleware', data, client);
                object__.send_data_to_api(
                    data.map(k => ({
                        ...k,
                        device: r.id,
                        client: r.client,
                        speed: k.speed || 0,
                        gps: k.gps ||
                            (["13", "23"].indexOf(k.case) > -1 ? r.gps : null),
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

module.exports = object__;