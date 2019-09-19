const mongo = require("@intugine-technologies/mongodb");
const net = require("net");
var client = new net.Socket();
const config = {
	DB_URI: process.env.DB_URI
};

let db = null;
mongo(config.DB_URI, "furlenco")
	.then(DB => {
		db = DB;
		return db.read(
			"status",
			{ tripId: db.objectid("5d835d6a58a259389dbda4e0") },
			"all"
		);
	})
	.then(r => {
		client.connect(1337, "127.0.0.1", function() {
			console.log("Connected");
			setTimeout(() => {
				client.write(Buffer.from("787811010353549090254961700321210404ec620d0a", 'hex'));
				console.log('login');
				r.forEach((k, index) => {
					setTimeout(() => {
						client.write(Buffer.from(k.input, 'hex'));
						console.log(index + 1, new Date(k.date), k.gps)
					}, (index + 1) * 100)
				});
			}, 10)
		});

		console.log(r.length);
	})
	.catch(e => {
		console.error(e);
	});