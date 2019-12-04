const mongo = require("@intugine-technologies/mongodb");
const net = require("net");
const parser = require('./tcp/parser/index.js');
const inspect = require('util').inspect;
const _ = require('lodash');
var client = new net.Socket();
const config = {
    DB_URI: process.env.DB_URI
};

let db = null;
mongo("mongodb+srv://intugine:NkVPR6VQUEXhyUwYHgQg4hjHspDH5k9a@cluster0-zhjde.mongodb.net", "__CONCOX__")
    .then(DB => {
        db = DB;
        return db.read(
            "invalid_status", { },
            10000,
        );
    })
    .then(r => {
        const data = 
        const invalid_status = _.chain([].concat(...r.filter(k => k.data.match(/.*0d0a$/i)).map(k => parser(k.data)))).filter(k => k !== '28').uniq().value()
        console.log(invalid_status);
        invalid_status.forEach((k) => {
            console.log("Case ", k, r.find(k => ))
        });
    })
    .catch(e => {
        console.error(e);
    });