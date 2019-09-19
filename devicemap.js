const config = require('./config'),
	mongo = require('@intugine-technologies/mongodb');
let db = null;
const data = `A140\t353549090246405\t40034\t9901950932
A141\t353549090251793\t40026\t9901950889
A142\t353549090246603\t40018\t9901950614`.split(/\n/).map(i => i.split(/\t/)).map(i => ({
	id: i[0],
	tel: i[3],
	ref: '0' + i[1],
	// client: 'furlenco',
	sim: i[2],
	warehouse: "11852",
	facility: "Panvel",
	tripId: null,
	vehicle: null,
	// location: 'Foxconn Sricity',
	// vehicle: null,
	// tripId: null,
}));
console.log(data);
mongo(config.DB_URI, 'furlenco')
	.then((DB) => {
		db = DB;
		return db.create('devices', data);
	})
	.then((r) => {
		console.log(r);
	})
	.catch((e) => {
		console.error(e);
	});
console.log(config);