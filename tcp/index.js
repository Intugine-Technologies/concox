const server = require("net").createServer();
const parser = require("./parser");
const config = require("../config");
const helpers = require("./helpers.js");
const inspector = require('event-loop-inspector')();
const app = require('express')();

console.log('test')

app.get('/inspector', (req, res) => {
    res.json(inspector.dump());
});

app.listen(9999, () => {
    console.log('Event loop inspector listening');
});

server.on("connection", socket => {
    socket.setEncoding("hex");
    const client = `${socket.remoteAddress}:${socket.remotePort}`;
    socket.setKeepAlive(true, 50000);
    socket.on("data", data => {
        const parsed__ = parser(data);
        if (
            Array.isArray(parsed__) &&
            parsed__.length > 0 &&
            typeof parsed__[0] === "object" &&
            parsed__[0].case
        ) {
            const imei =
                parsed__[0].case === "01" ?
                helpers.imei_manager.set(
                    parsed__[0].imei,
                    socket.remoteAddress,
                    socket.remotePort
                ) :
                helpers.imei_manager.get(
                    socket.remoteAddress,
                    socket.remotePort
                );
            if (imei) {
                helpers.data_middleware(parsed__.map(k => ({
                    ...k,
                    imei,
                    socket: client
                })));
            }
            parsed__.filter(k => k.output).forEach((k) => {
                socket.write(
                    Buffer.from(
                        k.output.match(/.{2}/g).map(i => parseInt(i, 16))
                    ));
            });
        } else helpers.send_invalid_data_to_api(data);
    });
    socket.on("error", err => {
        console.error({ event: "error", err: err.message, client });
        socket.end();
    });
    socket.on("close", () => {
        console.log({ event: "close", client });
        helpers.imei_manager.delete(client);
    });
    socket.setTimeout(1000 * 60 * 30, () => {
        console.log('Socket Timeout', client);
        helpers.imei_manager.delete(client);
        socket.end();
    });
    socket.on("end", (hadError) => {
        helpers.imei_manager.delete(client);
        console.log({ event: "end", client, hadError });
    });
});
server.on("error", err => {
    console.error({ event: "Server error", err });
});
server.on("close", err => {
    console.log({ event: "Server close", err });
});


server.listen(config.CONCOX_TCP_PORT, () => {
    console.log({
        event: "CONCOX_TCP_SERVER STARTED",
        PORT: config.CONCOX_TCP_PORT
    });
});

process.on("unhandledRejection", (reason, promise) => {
    console.error({
        event: "Unhandled Rejection at:",
        err: reason.stack ? reason.stack.toString() : reason
    });
});