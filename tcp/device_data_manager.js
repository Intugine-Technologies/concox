const api_handler = require("./api_handler.js");
const devices_data = {};
const fetch_devices_previous_data = async () => {
    api_handler({
        url: '/devices',
    })
    .then((r) => {
        r.forEach((k, kdx) => {
            setTimeout(() => {
                const data = await api_handler({ url: `/device/${k.imei}` });
                if(data && !devices_data[data.imei] && data.gps){
                    devices_data[k.imei] = {
                        id: k.id || 'NA',
                        client: k.client || null,
                        ...data
                    }
                    console.log('Data updated for', k.id);
                }
            }, kdx * 1000);
        });
    })
    .catch((e) => {
        console.error('Some error in setting previous devices data');
    });
};
fetch_devices_previous_data();

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