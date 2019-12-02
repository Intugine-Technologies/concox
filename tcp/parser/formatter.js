const moment = require('moment');
const helpers = require('./helpers');

module.exports = (__case__, __data) => {
  if (__case__ === '01') {
    const prefix = `0501${__data.slice(32, 36)}`;
    return {
      input: __data,
      tag: 'Login',
      case: '01',
      imei: __data.slice(8, 24),
      model: __data.slice(24, 28),
      timezone: helpers.timezone(__data.slice(28, 32)),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '10') {
    const prefix = `0510${__data.slice(48, 52)}`;
    return {
      input: __data,
      tag: 'GPS Info',
      case: '10',
      date: helpers.date(__data.slice(8, 20)),
      noSatellites: parseInt(__data.slice(21, 22), 16),
      gps: helpers.loc(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      language: parseInt(__data.slice(44, 48), 16) === 2 ? 'English' : 'Chinese',
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '11') {
    const prefix = `0511${__data.slice(40, 44)}`;
    return {
      input: __data,
      tag: 'LBS Info',
      case: '11',
      date: helpers.date(__data.slice(8, 20)),
      cellTower: [parseInt(__data.slice(20, 24), 16),
        parseInt(__data.slice(24, 26), 16),
        parseInt(__data.slice(26, 30), 16),
        parseInt(__data.slice(30, 36), 16),
      ],
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '12') {
    return {
      input: __data,
      tag: 'GPS Location Packet',
      case: '12',
      date: helpers.date(__data.slice(8, 20)),
      noSatellites: parseInt(__data.slice(21, 22), 16),
      gps: helpers.loc_at4(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      cellTower: [parseInt(__data.slice(44, 48), 16),
        parseInt(__data.slice(48, 50), 16),
        parseInt(__data.slice(50, 54), 16),
        parseInt(__data.slice(54, 60), 16),
      ],
      output: null,
    };
  }
  if (__case__ === '13') {
    const prefix = `0513${__data.slice(18, 22)}`;
    return {
      input: __data,
      tag: 'Status Info',
      case: '13',
      terminalInfo: __data.slice(8, 10),
      voltage: helpers.voltage(__data.slice(10, 12)),
      battery: helpers.battery(helpers.voltage(__data.slice(10, 12))),
      gsmStrength: helpers.gsmStrength(__data.slice(12, 14)),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '22') {
    // console.log('22', __data);
    // console.log('Acc', __data.slice(60, 62));
    // console.log('Data upload', __data.slice(62, 64))
    // console.log('GPS realtime', __data.slice(64, 66));
    // console.log(__data.length)
    return {
      input: __data,
      tag: 'GPS Location Packet',
      case: '22',
      date: helpers.date(__data.slice(8, 20)),
      noSatellites: parseInt(__data.slice(21, 22), 16),
      gps: helpers.loc_at4(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      cellTower: [parseInt(__data.slice(44, 48), 16),
        parseInt(__data.slice(48, 50), 16),
        parseInt(__data.slice(50, 54), 16),
        parseInt(__data.slice(54, 60), 16),
      ],
      output: null,
    };
  }
  if (__case__ === '23') {
    const prefix = `0523${__data.slice(18, 22)}`;
    return {
      input: __data,
      tag: 'Hearbeat Packet',
      case: '23',
      terminalInfo: helpers.terminal_info(__data.slice(8, 10)),
      voltage: parseFloat(parseInt(__data.slice(10, 14), 16) / 100),
      battery: helpers.battery_percentage(__data.slice(10, 14)),
      gsmStrength: helpers.gsmStrength(__data.slice(14, 16)),
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '16') {
    const prefix = `D19600CA00000001${__data.slice(76, 80)}`;
    return {
      input: __data,
      date: helpers.date(__data.slice(8, 20)),
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
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '18') {
    return {
      input: __data,
      output: null,
      case: '18',
      tag: 'LBS Extension Info',
      date: helpers.date(__data.slice(8, 20)),
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
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '1a') {
    const prefix = `000B9700CA00000001${__data.slice(48, 52)}`;
    return {
      input: __data,
      date: helpers.date(__data.slice(8, 20)),
      case: '1A',
      tag: 'GPS, phone number checking location info',
      noSatellites: parseInt(__data.slice(20, 22), 16),
      gps: helpers.loc(__data.slice(22, 38)),
      speed: parseInt(__data.slice(38, 40), 16),
      course: __data.slice(40, 44),
      phone: __data.slice(44, 86),
      language: parseInt(__data.slice(44, 48), 16) === 2 ? 'English' : 'Chinese',
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  if (__case__ === '8a') {
    const date = moment.utc().format('YY-MM-DD-HH-mm-ss').toString().replace(/-/g, '');
    const prefix = `0B8A${date}${__data.slice(8, 12)}`;
    return {
      input: __data,
      date: new Date(),
      case: '8A',
      tag: 'Time Check Packet info',
      output: helpers.appendStartEnd(prefix.concat(helpers.crc16(prefix))),
    };
  }
  return {
    input: __data,
    output: null,
  };
};
