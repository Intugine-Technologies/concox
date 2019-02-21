const config = require('./config'),
	mongo = require('@intugine-technologies/mongodb');
let db = null;
const data = `S1762	C36	358739053358892	7760192160
S1763	C37	358739053344587	7760192189
S1764	C38	358739053344363	7760192241
S1765	C39	358739053361250	7760192252
S1766	C40	358739053352523	7760192254
S1767	C41	358739053344355	7760192301
S1768	C42	358739053345337	7760192325
S1769	C43	358739053360633	7760192359
S1770	C44	358739053344462	7760192427
S1771	C45	358739053363942	7760192449
S1772	C46	358739053345634	7760192458
S1773	C47	358739053360450	7760192461
S1774	C48	358739053345261	7760192480
S1775	C49	358739053358637	7760192506
S1776	C50	358739053344215	7760192512
S1777	C51	358739053344272	7760192521
S1778	C52	358739053345501	7760192551
S1779	C53	358739053345568	7760192566
S1780	C54	358739053344330	7760192582
S1781	C55	358739053344314	7760192583`;
console.log(data);
console.log(data.split(/\n/).map(i => i.split(/\t/)).map(i => ({
	id: i[1],
	tel: i[3],
	imei: '0' + i[2],
	client: 'flipkart',
	sim: i[0],
	// location: 'Foxconn Sricity',
	// vehicle: null,
	// tripId: null,
})));
mongo(config.DB_URI, 'flipkart')
	.then((DB) => {
		db = DB;
		return db.create('devices', data.split(/\n/).map(i => i.split(/\t/)).map(i => ({
			id: i[1],
	tel: i[3],
	imei: '0' + i[2],
	sim: i[0],
    "location" : "MotherHub_GOA",
    "status": null,
    "to" : null
})));
	})
	.then((r) => {
		console.log(r);
	})
	.catch((e) => {
		console.error(e);
	});
console.log(config);