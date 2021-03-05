const crc16 = require('./crc16.js');
const battery_profile = [
    [0, 3.65],
    [2, 3.66],
    [5, 3.67],
    [7, 3.68],
    [10, 3.69],
    [12, 3.70],
    [15, 3.71],
    [17, 3.72],
    [20, 3.73],
    [25, 3.74],
    [30, 3.75],
    [35, 3.76],
    [40, 3.78],
    [45, 3.79],
    [48, 3.80],
    [50, 3.81],
    [52, 3.82],
    [54, 3.83],
    [55, 3.84],
    [57, 3.85],
    [59, 3.86],
    [60, 3.87],
    [62, 3.88],
    [64, 3.89],
    [67, 3.90],
    [68, 3.9],
    [70, 3.91],
    [71, 3.92],
    [72, 3.93],
    [73, 3.94],
    [74, 3.95],
    [75, 3.96],
    [77, 3.97],
    [78, 3.98],
    [79, 3.99],
    [80, 4.00],
    [81, 4.01],
    [83, 4.02],
    [84, 4.03],
    [85, 4.04],
    [87, 4.05],
    [88, 4.06],
    [89, 4.07],
    [90, 4.08],
    [91, 4.09],
    [92, 4.10],
    [93, 4.11],
    [94, 4.12],
    [95, 4.13],
    [96, 4.14],
    [97, 4.15],
    [98, 4.16],
    [99, 4.17],
    [100, 4.20]
];

const addZero = __num => (__num >= 10 ? __num : `0${__num}`);
addZero_to_timezone = (str) => {
  const __hr = str.split(":")[0]
  const __min = str.split(":")[1]
	if(__hr && __min){
		const hr = __hr.length === 2 ? __hr : __hr.length === 1 ? "0" + __hr : "00"
	 	 const min = __min.length === 2 ? __min : __min.length === 1 ? __min + "0" : "00"
 		 return hr + ":" + min;

	} return null;
};
const timezone = (tzl) => {
    const gmt_sign = (parseInt(tzl.slice(-1), 16).toString(2).slice(-3, -2) || "0") === "0" ? "+" : "-";
    const gmt_diff = addZero_to_timezone((parseInt(tzl.slice(0, 3), 16) / 100).toString().replace('.', ':'))
    return gmt_diff ? (gmt_sign + gmt_diff) : null;
};

const terminal_info = (__str) => {
    const __data = parseInt(__str, 16).toString(2).padStart(8);
    return {
        ignition: __data[0] === "0" ? true : false,
        gps_tracking: __data[1] === "1" ? true : false,
        charging: __data[5] === "1" ? true : false,
        acc: __data[6] === "1" ? true : false,
        defense: __data[7] === "1" ? true : false
    }
};

const batteryPercentage = (__data) => {
    const volt = parseFloat(parseInt(__data, 16) / 100);
    if (!volt || typeof(volt) !== 'number') return null;
    if (volt <= 3.65) return 0;
    if (volt >= 4.2) return 100;
    return (battery_profile.find(k => k[1] >= volt) || [null])[0]
}

// const batteryPercentage = __data => (100 - (100 * (
//   (4.2 - parseFloat(parseInt(__data, 16) / 100)) / (4.2 - 3.65)
// )));
const battery = (voltage) => {
    switch (voltage) {
        case 'No power(shutdown)':
            return 0;
        case 'Extremely low battery (not enough for calling or sending text messages)':
            return 5;
        case 'Very low battery (low battery alarms)':
            return 20;
        case 'Low battery':
            return 35;
        case 'Medium':
            return 55;
        case 'High':
            return 75;
        case 'Very high':
            return 90;
        default:
            return null;
    }
};
const date = (__date) => {
    const year = parseInt(__date.slice(0, 2), 16);
    const month = parseInt(__date.slice(2, 4), 16);
    const day = parseInt(__date.slice(4, 6), 16);
    const hour = parseInt(__date.slice(6, 8), 16);
    const min = parseInt(__date.slice(8, 10), 16);
    const sec = parseInt(__date.slice(10, 12), 16);
    return new Date(`20${year}-${addZero(month)}-${addZero(day)}T${addZero(hour)}:${addZero(min)}:${addZero(sec)}.000Z`);
};
const loc = (__str) => {
    const tlat = parseInt(__str.slice(0, 8), 16) / 30000;
    const tlng = parseInt(__str.slice(-8), 16) / 30000;
    const degLat = parseInt(tlat / 60, 10);
    const degLng = parseInt(tlng / 60, 10);
    const minLat = tlat % 60;
    const minLng = tlng % 60;
    return [degLat + minLat / 60, degLng + minLng / 60];
};
const locAT4 = __str => [
    parseFloat(parseInt(__str.slice(0, 8), 16) / (1800000)),
    parseFloat(parseInt(__str.slice(8, 16), 16) / (1800000)),
];
const voltage = (__str) => {
    switch (parseInt(__str, 16)) {
        case 0:
            return 'No power(shutdown)';
        case 1:
            return 'Extremely low battery (not enough for calling or sending text messages)';
        case 2:
            return 'Very low battery (low battery alarms)';
        case 3:
            return 'Low battery';
        case 4:
            return 'Medium';
        case 5:
            return 'High';
        case 6:
            return 'Very high';
        default:
            return null;
    }
};
const gsmStrength = (__str) => {
    switch (parseInt(__str, 16)) {
        case 0:
            return 'No Signal';
        case 1:
            return 'Extremely weak signal';
        case 2:
            return 'Very weak signal';
        case 3:
            return 'Good signal';
        case 4:
            return 'Strong signal';
        default:
            return null;
    }
};
const alarm = (__str) => {
    switch (parseInt(__str, 16)) {
        case 0:
            return 'Normal';
        case 1:
            return 'SOS';
        case 2:
            return 'Cut power';
        case 3:
            return 'Vibration';
        case 4:
            return 'In fence';
        case 5:
            return 'out fence';
        case 6:
            return 'Speed over';
        case 9:
            return 'Moving';
        case 10:
            return 'in GPS shield';
        case 11:
            return 'out of GPS shield';
        case 12:
            return 'power on';
        case 13:
            return 'GPS first location';
        default:
            return null;
    }
};
const appendStartEnd = data => `7878${data}0d0a`.toLowerCase();

const hex_to_ascii = (__str) => {
    const hex = __str.toString();
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    }
    return str;
};

const ascii_to_hex = (__str) => {
    return __str.split('').map(k => k.charCodeAt(0).toString(16).padStart(2, '0')).join('');
};

module.exports = {
    crc16,
    date,
    loc,
    loc_at4: locAT4,
    hex_to_ascii,
    ascii_to_hex,
    voltage,
    gsmStrength,
    terminal_info,
    battery_percentage: batteryPercentage,
    alarm,
    appendStartEnd,
    battery,
    timezone
};
