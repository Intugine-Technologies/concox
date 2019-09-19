const api_handler = require("./api_handler.js");
const devices_data = {};
module.exports = {
    set: data => {
        if (data)
            devices_data[data.imei] = { ...devices_data[data.imei], ...data };
    },
    get: imei =>
        new Promise((resolve, reject) => {
            api_handler({ url: `/device/${imei}` })
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
        })
};