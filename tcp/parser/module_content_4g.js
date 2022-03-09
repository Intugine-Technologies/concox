module.exports = (_module, _content) => {
	let output = null;
	// console.log(_module, _content)
	switch(_module){
		// case "0000": break; //transfer type
		case "0001": {
			output = {
				imei: _content
			};
			break;
		}
		case "0002": {
			output = {
				imsi: _content
			};
			break;
		}
		case "0003": {
			output = {
				iccid: _content
			};
			break;
		}
		case "0009": {
			output = {
				noSatellites: parseInt(_content, 16)
			};
			break;
		}
		// case "000a": break; //Visible satellites
		// case "000b": break; //Satellite signal strength
		case "0011": {
			output = {
				cellTower: [
	        parseInt(_content.slice(0, 4), 16),
	        parseInt(_content.slice(4, 8), 16),
	        parseInt(_content.slice(8, 12), 16),
	        parseInt(_content.slice(12, 18), 16),
	      ],
	      RSSI: parseInt(_content.slice(18), 16),
			};
			break;
		}
		// case "0012": break; //Neighbouring cells
		// case "0016": break; //GSM Signal CSQ
		case "0018": {
			output = {
				voltage: parseFloat(parseInt(_content, 16) / 100)
				//battery
			};
			break;
		}
		// case "0028": break; //HDOP
		// case "0029": break; //Sequence number
		// case "002a": break; //Door button, tamper button
		// case "002b": break; //Boot reason
		// case "002c": {
		// 	output = {
		// 		time: new Date(),
		// 		// time: new Date(parseInt(_content, 16) * 1000)
		// 	}
		// }
		// case "002e": break; //mileage stats
		// case "0030": break; //reporting mode
		// case "0031": break; //geofence triggers
		case "0033": {
			output = {
				time: new Date(parseInt(_content.slice(0, 8), 16) * 1000),
				noSatellites: parseInt(_content.slice(8, 10), 16),
				gps: [
					parseInt(_content.slice(14, 22), 16) / 1800000,
					parseInt(_content.slice(22, 30), 16) / 1800000
				],
				speed: parseInt(_content.slice(30, 32), 16),
			};
			break;
		}
		// case "0034": break; //Report Status
		// case "0035": break; //GPS realtime or buffer
		case "0036": {
			output = {
				WiFi: Array.from({
					length: parseInt(_content.slice(0, 2), 16)
				}, (v, i) => {
					return {
						mac_address: _content.slice(i * 14 + 2, i*14 + 12 + 2),
						strength: _content.slice(i * 14 + 2 + 12, i*14 + 14 + 2),
					};
				})
			};
			break;
		}
		case "0043": {
			output = {
				LTEMain: {
					mcc: parseInt(_content.slice(0, 4), 16),
					mnc: parseInt(_content.slice(4, 8), 16),
					tac: parseInt(_content.slice(8, 12), 16),
					ci: parseInt(_content.slice(12, 20), 16),
					RSSI: parseInt(_content.slice(20), 16),
				}
			};
			break;
		}
		case "0044": {
			output = {
				LTEAuxillary: Array.from({
					length: _content.length / 14
				}, (v, i) => {
					return {
						tac: parseInt(_content.slice(i * 14, i * 14 + 4), 16),
						ci: parseInt(_content.slice(4 + i * 14, 4 + i * 14 + 8), 16),
						RSSI: parseInt(_content.slice(12 + i * 14, 12 + i * 14 + 2), 16),
					};
				})
			};
			break;
		}
		case "0045": {
			output = {
				bluetooth: Array.from({
					length: parseInt(_content.slice(0, 2), 16)
				}, (v, i) => {
					return {
						mac_address: _content.slice(2 + i * 22, 2 + i * 22 + 12),
						strength: _content.slice(2 + 12 + i * 22, 2 + 12 + i * 22 + 2),
						major: _content.slice(2 + 14 + i * 22, 2 + 14 + i * 22 + 4),
						minor: _content.slice(2 + 18 + i * 22, 2 + 18 + i * 22 + 4),
					};
				})
			};
			break;
		}
		case "1000": {
			output = {
				to_return: Boolean(parseInt(_content))
			};
			break;
		}
	}
	return output;
};