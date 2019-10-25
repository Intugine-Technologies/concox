const parser = require('../tcp/parser/index.js');
const distance = require('@intugine-technologies/distance');
const mongo = require('@intugine-technologies/mongodb');
const BSON = require('bson');
const Long = BSON.Long;

// Serialize a document
const doc = { long: Long.fromNumber(100) };
const data = BSON.serialize(doc);
console.log('data:', data);

// Deserialize the resulting Buffer
// const doc_2 = BSON.deserialize(data);
// console.log('doc_2:', doc_2);
// let db = null;
// const config = {
//     DB_URI: 'mongodb+srv://intugine:NkVPR6VQUEXhyUwYHgQg4hjHspDH5k9a@cluster0-zhjde.mongodb.net'
// };

// __data = [];
// mongo(config.DB_URI, "furlenco")
// 	.then((DB) => {
// 		db = DB;
// 		return db.read('status', {tripId: db.objectid('5d9ed94058a259389d028ef1')}, 'all');
// 	})
// 	.then((r) => {
// 		__data.push(...r);
// 		analyze(__data.map(k => ({
// 			input: k.input,
// 			case: k.case,
// 			date: k.date,
// 			time: k.time,
// 			gps: k.gps,
// 			serial: parseInt(k.input.slice(-12, -8), 16)
// 		})))
// 	})
// 	.catch((e) => {
// 		console.error(e);
// 	});
// // const data = require('./A456.json')/*.filter(k => k.case === "22")*//*.filter(k => k._id === "5d96eae158a259389de955b6")*/.map(k => ({
// // 	input: k.input,
// // 	case: k.case,
// // 	date: k.date,
// // 	time: k.time,
// // 	gps: k.gps,
// // 	serial: parseInt(k.input.slice(-12, -8), 16)
// // }));
// // console.table(data);

// const analyze = (data) => {
// 	data.forEach((k) => {
// 		const parsed = parser(k.input);
// 		if(parsed && parsed.length && parsed[0].gps){
// 			k.parsed_gps = parsed[0].gps
// 		}
// 		delete k.input
// 	})
// 	console.table(data);
// };