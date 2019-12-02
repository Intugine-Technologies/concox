const api_handler = require("./api_handler.js");
const devices_data = {};
const fetch_devices_previous_data = () => {
    api_handler({
        url: '/devices',
    })
    .then((r) => {
        r.data.forEach((k, kdx) => {
            setTimeout(async () => {
                const data = await api_handler({ url: `/device/${k.imei}` });
                if(data && !devices_data[k.imei] && data.gps){
                    devices_data[k.imei] = {
                        id: k.id || 'NA',
                        client: k.client || null,
                        ...data
                    }
                }
            }, kdx * 1000);
        });
    })
    .catch((e) => {
        console.error('Some error in setting previous devices data');
    });
};
setTimeout(() => {
    fetch_devices_previous_data();
}, 2000);

const obj = {
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
module.exports = obj;