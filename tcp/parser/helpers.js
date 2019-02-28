const crc16 = require('./crc16.js');

const addZero = __num => (__num >= 10 ? __num : `0${__num}`);
const batteryPercentage = __data => (100 - (100 * (
  (4.2 - parseFloat(parseInt(__data, 16) / 100)) / (4.2 - 3.65)
)));
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
  return new Date(`20${year}-${addZero(month)}-${addZero(day)}T${addZero(hour)}:${addZero(min)}:${addZero(sec)}+08:00`);
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
const appendStartEnd = data => `7878${data}0D0A`;
module.exports = {
  crc16,
  date,
  loc,
  loc_at4: locAT4,
  voltage,
  gsmStrength,
  battery_percentage: batteryPercentage,
  alarm,
  appendStartEnd,
  battery,
};
