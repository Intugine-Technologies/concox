const crc16 = require('./crc16.js');
const module_content_4g = require('./module_content_4g.js');
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
    if (__hr && __min) {
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
    if (!volt || typeof (volt) !== 'number') return null;
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
    if (__str[0] === 'F') {
        return 'External Power'
    };
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
        case 14:
            return 'External Power Low Battery';
        case 15:
            return 'External Power Low Battery Protection';
        case 17:
            return 'Power Off';
        case 19:
            return 'Demolition Alarm';
        case 20:
            return 'Door Alarm';
        case 21:
            return 'Low Power Shutdown';
        case 41:
            return 'Harsh Breaking';
        case 44:
            return 'Collision';
        case 45:
            return 'Flip';
        case 47:
            return 'Rapid Acceleration';
        case 76:
            return 'Sharp Turn';
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

const temperature = (__str) => {
    return parseInt(__str.slice(2, 6), 16) / 10;
}

const modulecontent4g = (__str = "") => {
    // console.log("Str", __str)
    let output = {};
    let content = __str;
    do {
        const _module = content.slice(0, 4);
        const _module_content_length = parseInt(content.slice(4, 8), 16);
        // console.log("Module", _module, _module_content_length, content.slice(8, 8 + _module_content_length * 2));
        const result = module_content_4g(_module, content.slice(8, 8 + _module_content_length * 2));
        // console.log('Result', result);
        content = content.slice(8 + _module_content_length * 2);
        output = {
            ...output,
            ...result
        };
    } while (content);
    return output;
};

const hex_to_decimal = (hexValue) => {
    return parseInt(hexValue, 16);
}

function hex_to_binary(hex) {
    return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

function getALM1Values(hex) {
    const binaryForm = hex_to_binary(hex);
    const headings = {
        '0': 'SMS Alarm',
        '1': 'Phone Alarm',
        '2': 'Network Alarm',
        '3': 'Displacement Alarm',
        '4': 'SMS Alarm',
        '5': 'Phone Alarm',
        '6': 'Network Alarm',
        '7': 'Vibration Alarm'
    }
    const res = {};
    for (let i = 0; i < 8; i++) {
        res[headings[i]] = binaryForm[7 - i] == 1 ? true : false;
    }
    return res;
}

function getALM2Values(hex) {
    const binaryForm = hex_to_binary(hex);
    const headings = {
        '0': 'SMS Alarm',
        '1': 'Phone Alarm',
        '2': 'Network Alarm',
        '3': 'Low External Battery Alarm',
        '4': 'SMS Alarm',
        '5': 'Phone Alarm',
        '6': 'Network Alarm',
        '7': 'Low Internal Battery Alarm'
    }
    const res = {};
    for (let i = 0; i < 8; i++) {
        res[headings[i]] = binaryForm[7 - i] == 1 ? true : false;
    }
    return res;
}

function getALM3Values(hex) {
    const binaryForm = hex_to_binary(hex);
    const headings = {
        '0': 'SMS Alarm',
        '1': 'Phone Alarm',
        '2': 'Network Alarm',
        '3': 'Power Off Alarm',
        '4': 'SMS Alarm',
        '5': 'Phone Alarm',
        '6': 'Network Alarm',
        '7': 'Overspeed Alarm'
    }
    const res = {};
    for (let i = 0; i < 8; i++) {
        res[headings[i]] = binaryForm[7 - i] == 1 ? true : false;
    }
    return res;
}

function getALM4Values(hex) {
    const binaryForm = hex_to_binary(hex);
    const headings = {
        '0': 'SMS Alarm',
        '1': 'Phone Alarm',
        '2': 'Network Alarm',
        '3': 'Sound Alarm',
        '4': 'SMS Alarm',
        '5': 'Phone Alarm',
        '6': 'Network Alarm',
        '7': 'SOS Alarm'
    }
    const res = {};
    for (let i = 0; i < 8; i++) {
        res[headings[i]] = binaryForm[7 - i] == 1 ? true : false;
    }
    return res;
}

function getSTA1Values(hex) {
    const binaryForm = hex_to_binary(hex);
    const headings = {
        '0': 'Anti-removal Alarm Status',
        '1': 'Anti-removal button',
        '4': 'Remotely Disarm',
        '5': 'Manually Arm',
        '6': 'Automatically Arm',
        '7': 'Arm Status'
    }
    const res = {};
    for (let i = 0; i < 8; i++) {
        if (i == 2 || i == 3) {
            continue;
        }
        if (i == 1) {
            res[headings[i]] = binaryForm[7 - i] == 1 ? 'Pressed' : 'Released';
        }
        else if (i == 7) {
            res[headings[i]] = binaryForm[7 - i] == 1 ? 'Armed' : 'Disarmed';
        }
        else {
            res[headings[i]] = binaryForm[7 - i] == 1 ? true : false;
        }
    }
    return res;
}

function getDYDValues(hex) {
    const binaryForm = hex_to_binary(hex);
    const headings = {
        '0': 'Oil/Electricity connection',
        '1': 'Oil/Electricity cutoff',
        '2': 'Deferred execution caused by un-located GPS',
        '3': 'Deferred execution caused by overspeed',
    }
    const res = {};
    for (let i = 0; i < 4; i++) {
        res[headings[i]] = binaryForm[7 - i] == 1 ? true : false;
    }
    return res;
}

const getSubTagDetails = (sub_tag, hexData) => {
    const data = {};
    // console.log('hex: ',hexData);
    if (sub_tag === '00') {
        const decimalValue = hex_to_decimal(hexData) / 100;
        data['name'] = 'External power voltage';
        data['sub_tag_data'] = { 'Voltage': decimalValue };
    }
    if (sub_tag === '01' || sub_tag === '02' || sub_tag === '03') {
        data['name'] = 'Customized';
    }
    if (sub_tag === '04') {
        const parsedData = hex_to_ascii(hexData);
        // console.log('data', parsedData)
        data['name'] = 'Terminal status synchronization';
        const fields = parsedData.split(';');
        const parsedFields = [];
        fields.forEach((each) => {
            // console.log(each);
            const splitEach = each.split('=');
            // console.log(splitEach);
            if (splitEach[0] === 'ALM1') {
                const res = getALM1Values(splitEach[1]);
                res['tag'] = 'Alarm Bit 1'
                parsedFields.push(res);
            }
            if (splitEach[0] === 'ALM2') {
                const res = getALM2Values(splitEach[1]);
                res['tag'] = 'Alarm Bit 2'
                parsedFields.push(res);
            }
            if (splitEach[0] === 'ALM3') {
                const res = getALM3Values(splitEach[1]);
                res['tag'] = 'Alarm Bit 3'
                parsedFields.push(res);
            }
            if (splitEach[0] === 'ALM4') {
                const res = getALM4Values(splitEach[1]);
                res['tag'] = 'Alarm Bit 4'
                parsedFields.push(res);
            }
            if (splitEach[0] === 'STA1') {
                const res = getSTA1Values(splitEach[1]);
                res['tag'] = 'Status Bit 1'
                parsedFields.push(res);
            }
            if (splitEach[0] === 'DYD') {
                const res = getDYDValues(splitEach[1]);
                res['tag'] = 'Fuel/Electricity Cutoff Status'
                parsedFields.push(res);
            }
            if (splitEach[0] === 'SOS') {
                const sosNumbers = splitEach[1].split(',');
                // console.log(sosNumbers);
                const sosList = [];
                sosNumbers.forEach((num) => {
                    if (num != '') {
                        sosList.push(num);
                    }
                })
                // console.log(sosList);
                if (sosList.length !== 0) {
                    const res = {};
                    res['tag'] = 'SOS Number';
                    res['SOS Numbers'] = sosList;
                    parsedFields.push(res);
                }
            }
            if (splitEach[0] === 'CENTER') {
                //adopt ASCII to transmit
                // console.log(splitEach[1]);
                if (splitEach[1] !== '') {
                    const res = {};
                    res['tag'] = 'Centre Number';
                    res['Centre Number'] = splitEach[1];
                    parsedFields.push(res);
                }
            }
            if (splitEach[0] === 'FENCE') {
                //adopt ASCII to transmit
                // console.log(splitEach[1]);
                if (splitEach[1] !== '') {
                    const res = {};
                    res['tag'] = 'GeoFence';
                    res['GeoFence'] = splitEach[1];
                    parsedFields.push(res);
                }
            }
            if (splitEach[0] === 'MODE') {
                //adopt ASCII to transmit
                // console.log(splitEach[1]);
                if (splitEach[1] !== '') {
                    const res = {};
                    res['tag'] = 'Mode';
                    res['Mode'] = splitEach[1].split(',');
                    parsedFields.push(res);
                }
            }
            // if(splitEach[0]==='IMSI'){
            //     if(splitEach[1]!==''){
            //         parsedFields['IMSI'] = splitEach[1];
            //     }
            // }
            // if(splitEach[0]==='ICCID'){
            //     if(splitEach[1]!==''){
            //         parsedFields['ICCID'] = splitEach[1];
            //     }
            // }
            // if(splitEach[0]==='STARTTIME'){
            //     if(splitEach[1]!==''){
            //         parsedFields['Log in successfully'] = splitEach[1];
            //     }
            // }
            // if(splitEach[0]==='LOGINPACKET'){
            //     if(splitEach[1]!==''){
            //         parsedFields['Number of login packets'] = splitEach[1];
            //     }
            // }
            // if(splitEach[0]==='RESTART'){
            //     if(splitEach[1]!==''){
            //         parsedFields['Reboot times'] = splitEach[1];
            //     }
            // }
        })
        data['sub_tag_data'] = parsedFields;
    }
    if (sub_tag === '05') {
        const binaryForm = hex_to_binary(hexData);
        const headings = {
            '0': 'Door Status',
            '1': 'Triggering Status',
            '2': 'IO Status'
        }
        const parsedFields = {};
        for (let i = 0; i < 3; i++) {
            if(i==0){
                parsedFields[headings[i]] = binaryForm[3 - i] == 1 ? true : false;
            }
            if(i==1){
                parsedFields[headings[i]] = binaryForm[3 - i] == 1 ? 'High triggering' : 'Low triggering';
            }
            if(i==2){
                parsedFields[headings[i]] = binaryForm[3 - i] == 1 ? 'High' : 'Low';
            }
        }
        data['name'] = 'Door status';
        data['sub_tag_data'] = parsedFields;
    }
    if (sub_tag === '08') {
        const parsedData = hex_to_ascii(hexData);
        data['name'] = 'Self-detection parameters';
        data['sub_tag_data'] = parsedData;

    }
    if (sub_tag === '0a') {
        const parsedData = {
            'IMEI': hexData.slice(0,9),
            'IMSI':hexData.slice(9,17),
            'ICCID':hexData.slice(17,27)
        }
        data['name'] = 'ICCID';
        data['sub_tag_data'] = parsedData;
    }
    if (sub_tag === '11') {
        const parsedData = hex_to_decimal(hexData);
        data['name'] = 'Vibration times';
        data['sub_tag_data'] = parsedData;
    }
    if (sub_tag === '22') {
        data['name'] = 'Device status information';
    }
    return data;
}

const informationTransmissionHelpers = {
    'getSubTagDetails': getSubTagDetails
}

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
    timezone,
    temperature,
    modulecontent4g,
    informationTransmissionHelpers,
};
