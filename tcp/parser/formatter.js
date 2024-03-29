const moment = require('moment');
const helpers = require('./helpers');
const infoTransHelpers = helpers.informationTransmissionHelpers;

module.exports = (__data) => {
  const __case__ = __data.slice(0, 4) === "7878" ? __data.slice(6, 8) : __data.slice(8, 10);
  console.log(__case__, __data)
  if (__case__ === '01') {
    const prefix = `0501${__data.slice(32, 36)}`;
    return {
      input: __data,
      tag: 'Login',
      case: '01',
      imei: __data.slice(8, 24),
      model: __data.slice(24, 28),
      timezone: helpers.timezone(__data.slice(28, 32)),
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '10') {
    const prefix = `0510${__data.slice(48, 52)}`;
    return {
      input: __data,
      tag: 'GPS Info',
      case: '10',
      time: helpers.date(__data.slice(8, 20)),
      noSatellites: parseInt(__data.slice(21, 22), 16),
      gps: helpers.loc(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      language: parseInt(__data.slice(44, 48), 16) === 2 ? 'English' : 'Chinese',
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '11') {
    const prefix = `0511${__data.slice(40, 44)}`;
    return {
      input: __data,
      tag: 'LBS Info',
      case: '11',
      time: helpers.date(__data.slice(8, 20)),
      cellTower: [parseInt(__data.slice(20, 24), 16),
        parseInt(__data.slice(24, 26), 16),
        parseInt(__data.slice(26, 30), 16),
        parseInt(__data.slice(30, 36), 16),
      ],
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '12') {
    return {
      input: __data,
      tag: 'GPS Location Packet',
      case: '12',
      time: helpers.date(__data.slice(8, 20)),
      noSatellites: parseInt(__data.slice(21, 22), 16),
      gps: helpers.loc_at4(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      cellTower: [parseInt(__data.slice(44, 48), 16),
        parseInt(__data.slice(48, 50), 16),
        parseInt(__data.slice(50, 54), 16),
        parseInt(__data.slice(54, 60), 16),
      ],
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: null,
    };
  }
  if (__case__ === '13') {
    const prefix = `0513${__data.slice(18, 22)}`;
    const temp = {
      input: __data,
      tag: 'Status Info',
      case: '13',
      time: new Date(),
      terminalInfo: __data.slice(8, 10),
      voltage: helpers.voltage(__data.slice(10, 12)),
      battery: helpers.battery(helpers.voltage(__data.slice(10, 12))),
      gsmStrength: helpers.gsmStrength(__data.slice(12, 14)),
      
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };

    //wanway temp devices
    if(__data.length === 32){
      temp.external_temp = helpers.temperature(__data.slice(14,20));
    }

    return temp;
  }
  if (__case__ === '22') {
    return {
      input: __data,
      tag: 'GPS Location Packet',
      case: '22',
      time: helpers.date(__data.slice(8, 20)),
      noSatellites: parseInt(__data.slice(21, 22), 16),
      gps: helpers.loc_at4(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      cellTower: [parseInt(__data.slice(44, 48), 16),
        parseInt(__data.slice(48, 50), 16),
        parseInt(__data.slice(50, 54), 16),
        parseInt(__data.slice(54, 60), 16),
      ],
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: null,
    };
  }
  if (__case__ === 'a0') {
    return {
      input: __data,
      tag: 'GPS Location Packet',
      case: 'a0',
      time: helpers.date(__data.slice(8, 20)),
      noSatellites: parseInt(__data.slice(21, 22), 16),
      gps: helpers.loc_at4(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      cellTower: [parseInt(__data.slice(44, 48), 16),
        parseInt(__data.slice(48, 50), 16),
        parseInt(__data.slice(50, 58), 16),
        parseInt(__data.slice(58, 74), 16),
      ],
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: null,
    };
  }
  if (__case__ === '23') {
    const prefix = `0523${__data.slice(18, 22)}`;
    return {
      input: __data,
      tag: 'Hearbeat Packet',
      case: '23',
      time: new Date(),
      terminalInfo: helpers.terminal_info(__data.slice(8, 10)),
      voltage: parseFloat(parseInt(__data.slice(10, 14), 16) / 100),
      battery: helpers.battery_percentage(__data.slice(10, 14)),
      gsmStrength: helpers.gsmStrength(__data.slice(14, 16)),
      language: parseInt(__data.slice(16, 20), 16) === 2 ? 'English' : 'Chinese',
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '16') {
    const prefix = `D19600CA00000001${__data.slice(76, 80)}`;
    return {
      input: __data,
      time: helpers.date(__data.slice(8, 20)),
      case: '16',
      tag: 'Combined information packet of GPS, LBS and Status',
      noSatellites: parseInt(__data.slice(20, 22), 16),
      gps: helpers.loc(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
      cellTower: [parseInt(__data.slice(50, 54), 16),
        parseInt(__data.slice(54, 56), 16),
        parseInt(__data.slice(56, 60), 16),
        parseInt(__data.slice(60, 66), 16),
      ],
      terminalInfo: __data.slice(66, 68),
      voltage: helpers.voltage(__data.slice(68, 70)),
      battery: helpers.battery(helpers.voltage(__data.slice(68, 70))),
      gsmStrength: helpers.gsmStrength(__data.slice(70, 72)),
      alarm: helpers.alarm(__data.slice(72, 74)),
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      language: parseInt(__data.slice(74, 76), 16) === 2 ? 'English' : 'Chinese',
    };
  }
  if (__case__ === '26') {
    const prefix = `D19600CA00000001${__data.slice(76, 80)}`;
    return {
      input: __data,
      time: helpers.date(__data.slice(8, 20)),
      case: '26',
      tag: 'Alarm Packet',
      noSatellites: parseInt(__data.slice(20, 22), 16),
      gps: helpers.loc_at4(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
      cellTower: [parseInt(__data.slice(50, 54), 16),
        parseInt(__data.slice(54, 56), 16),
        parseInt(__data.slice(56, 60), 16),
        parseInt(__data.slice(60, 66), 16),
      ],
      terminalInfo: __data.slice(66, 68),
      voltage: helpers.voltage(__data.slice(68, 70)),
      battery: helpers.battery(helpers.voltage(__data.slice(68, 70))),
      gsmStrength: helpers.gsmStrength(__data.slice(70, 72)),
      alarm: helpers.alarm(__data.slice(72, 74)),
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      language: parseInt(__data.slice(74, 76), 16) === 2 ? 'English' : 'Chinese',
    };
  }
  if (__case__ === '17') {
    const prefix = `D19700CA00000001${__data.slice(66, 70)}`;
    return {
      input: __data,
      tag: 'LBS, phone number checking location info',
      case: '17',
      cellTower: [parseInt(__data.slice(8, 12), 16),
        parseInt(__data.slice(12, 14), 16),
        parseInt(__data.slice(14, 18), 16),
        parseInt(__data.slice(18, 24), 16),
      ],
      phone: __data.slice(24, 66),
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '18' || __case__ === "28" || __case__ === "24") {
    return {
      input: __data,
      output: null,
      case: '18',
      tag: 'LBS Extension Info',
      time: helpers.date(__data.slice(8, 20)),
      cellTower: [
        parseInt(__data.slice(20, 24), 16),
        parseInt(__data.slice(24, 26), 16),
        parseInt(__data.slice(26, 30), 16),
        parseInt(__data.slice(30, 34), 16),
      ],
      RSSI: parseInt(__data.slice(34, 36), 16),
      neighbouringCells: [{
        lac: parseInt(__data.slice(36, 40), 16),
        ci: parseInt(__data.slice(40, 44), 16),
        rssi: parseInt(__data.slice(44, 46), 16),
      },
      {
        lac: parseInt(__data.slice(46, 50), 16),
        ci: parseInt(__data.slice(50, 54), 16),
        rssi: parseInt(__data.slice(54, 56), 16),
      },
      {
        lac: parseInt(__data.slice(56, 60), 16),
        ci: parseInt(__data.slice(60, 64), 16),
        rssi: parseInt(__data.slice(64, 66), 16),
      },
      {
        lac: parseInt(__data.slice(66, 70), 16),
        ci: parseInt(__data.slice(70, 74), 16),
        rssi: parseInt(__data.slice(74, 76), 16),
      },
      {
        lac: parseInt(__data.slice(76, 80), 16),
        ci: parseInt(__data.slice(80, 84), 16),
        rssi: parseInt(__data.slice(84, 86), 16),
      },
      {
        lac: parseInt(__data.slice(86, 90), 16),
        ci: parseInt(__data.slice(90, 94), 16),
        rssi: parseInt(__data.slice(94, 96), 16),
      }],
      timing_advance: __data.slice(96, 98),
      language: parseInt(__data.slice(98, 102), 16) === 2 ? 'English' : 'Chinese',
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
    };
  }
  if (__case__ === '19') {
    const prefix = `0597${__data.slice(30, 34)}`;
    return {
      input: __data,
      tag: 'LBS, Status info',
      case: '19',
      cellTower: [parseInt(__data.slice(8, 12), 16),
        parseInt(__data.slice(12, 14), 16),
        parseInt(__data.slice(14, 18), 16),
        parseInt(__data.slice(18, 24), 16),
      ],
      voltage: helpers.voltage(__data.slice(26, 28)),
      battery: helpers.battery(helpers.voltage(__data.slice(26, 28))),
      gsmStrength: helpers.gsmStrength(__data.slice(28, 30)),
      alarm:helpers.alarm(__data.slice(30, 32)),
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '1a') {
    const prefix = `000B9700CA00000001${__data.slice(48, 52)}`;
    return {
      input: __data,
      time: helpers.date(__data.slice(8, 20)),
      case: '1A',
      tag: 'GPS, phone number checking location info',
      noSatellites: parseInt(__data.slice(20, 22), 16),
      gps: helpers.loc(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      phone: __data.slice(44, 86),
      language: parseInt(__data.slice(44, 48), 16) === 2 ? 'English' : 'Chinese',
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '8a') {
    // const date = moment.utc().format('YY-MM-DD-HH-mm-ss').toString().replace(/-/g, '');
    const date = moment.utc().format('YY-MM-DD-HH-mm-ss').split('-').map(k => parseInt(k).toString(16).padStart(2, '0')).join('');
    const prefix = `0b8A${date}${__data.slice(8, 12)}`;
    return {
      input: __data,
      time: new Date(),
      case: '8A',
      tag: 'Time Check Packet info',
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__data.slice(8, 10) === "21"){
    return {
      input: __data,
      tag: 'Online Command',
      case: '21',
      time: new Date(),
      content_code: parseInt(__data.slice(18, 20)) === 1 ? "ASCII" : "UTF-16-BE",
      content: helpers.hex_to_ascii(__data.slice(20, -12)),
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: null,
    };
  }
  if (__case__ === "70") {
    const prefix = `000570${__data.slice(-12, -8)}`;
    const content = helpers.modulecontent4g(__data.slice(10, -6));
    return {
      input: __data,
      tag: 'GPS Position Packet',
      case: '70',
      ...content,
      time: content.time || new Date(),
      info_serial_no: parseInt(__data.split("").reverse().join("").slice(8, 12).split("").reverse().join(""), 16),
      output: content.to_return ? ("7979" + prefix.concat(helpers.crc16(prefix)) + "0d0a") : null,
    };
  }
  if(__case__ === "94"){
    const sub_tag_code = __data.slice(10,12);
    const subTagData = infoTransHelpers.getSubTagDetails(sub_tag_code,__data.slice(12,-12));
    const data = {
      input:__data,
      tag: 'Information Transmission',
      case:'94',
      sub_tag: subTagData.name,
      sub_tag_case: sub_tag_code,
      sub_tag_details: subTagData.sub_tag_data
    };

    // const fs = require('fs');
    // fs.writeFile('./test_data.json', JSON.stringify(data),(err)=>{
    //   if(err){
    //     throw err;
    //   }
    // });
  
    return data;
  }
  if(__case__ === "80"){
    const data = {
      input: __data,
      case: '80',
      tag: 'Online command sent by server',
      serverFlag: (parseInt(__data.slice(10,18), 16).toString(2)).padStart(8, '0'),
    };
    const check = __data.slice(18,-12).slice(-4);
    if(check==='0001' || check==='0002'){
      data['commandContent'] = helpers.hex_to_ascii(__data.slice(18,-16));
      if(check==='0001'){
        data['language'] = "Chinese";
      }
      else if(check==='0002'){
        data['language'] = "English";
      }
    }
    else{
      data['commandContent'] = helpers.hex_to_ascii(__data.slice(18,-12));
    }
    return data;
  }
  if(__case__ === "2c"){
    const data = {
      input: __data,
      case: '2C',
      tag: 'WIFI information packet',
      time: helpers.date(__data.slice(8,20)),
      mobileCountryCode:parseInt(__data.slice(20, 24), 16),
      mobileNetworkCode:parseInt(__data.slice(24, 26), 16),
    };
    const cellTower = [];
    for(let i=0;i<7;i++){
      const temp = {};
      temp['LAC'] = parseInt(__data.slice(26+12*i, 30+12*i), 16)
      temp['CI'] = parseInt(__data.slice(30+12*i, 36+12*i), 16)
      temp['RSSI'] = parseInt(__data.slice(36+12*i, 38+12*i), 16)
      cellTower.push(temp);
    }
    data['cellTower'] = cellTower
    data['timeLeads'] = parseInt(__data.slice(110, 112), 16);
    data['WiFiQuality'] = parseInt(__data.slice(112, 114), 16);

    const remaining = __data.slice(114, -12);
    let dataLen = remaining.length;
    const wifi = [];
    let pos = 0;
    while(pos<dataLen){
      const temp = {};
      temp['WiFi MAC'] = parseInt(remaining.slice(pos,pos+12),16);
      pos+=12;
      temp['WiFi Strength'] = parseInt(remaining.slice(pos,pos+2),16);
      pos+=2;
      const ssidLen = parseInt(remaining.slice(pos,pos+2),16);
      temp['WiFi SSID Length'] = ssidLen;
      pos+=2;
      temp['WiFi SSID'] = parseInt(remaining.slice(pos,pos+2*ssidLen),16);
      pos = pos+2*ssidLen;
      wifi.push(temp);
    }

    data['wifiDetails'] = wifi;

    // const fs = require('fs');
    // fs.writeFile('./test_data.json', JSON.stringify(data),(err)=>{
    //   if(err){
    //     throw err;
    //   }
    // });
    
    return data;
  }
  return {
    input: __data,
    output: null,
  };
};
