const mongo = require("@intugine-technologies/mongodb");
const net = require("net");
var client = new net.Socket();
const config = {
	DB_URI:
		"mongodb+srv://intugine:NkVPR6VQUEXhyUwYHgQg4hjHspDH5k9a@cluster0-zhjde.mongodb.net"
};

let db = null;
mongo(config.DB_URI, "furlenco")
	.then(DB => {
		db = DB;
		return db.read(
			"status",
			{ tripId: db.objectid("5d0b09e46b59cf4dd15a0134") },
			"all"
		);
	})
	.then(r => {
		client.connect(1337, "127.0.0.1", function() {
			console.log("Connected");
			setTimeout(() => {
				client.write(new Buffer("7878110103587390521552732020320106a0b3280d0a", 'hex'));
				console.log('login');
				r.forEach((k, index) => {
					setTimeout(() => {
						client.write(new Buffer(k.input, 'hex'));
						console.log(index + 1, new Date(k.date), k.gps)
					}, (index + 1) * 100)
				});
			}, 100)
		});

		console.log(r.length);
	})
	.catch(e => {
		console.error(e);
	});