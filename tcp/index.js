const server = require("net").createServer();
const parser = require("./parser");
const config = require("../config");
const helpers = require("./helpers.js");
const inspector = require('event-loop-inspector')();
const app = require('express')();

app.get('/inspector', (req, res) => {
    res.json(inspector.dump());
});

app.listen(9999, () => {
    console.log('Event loop inspector listening');
});

server.on("connection", socket => {
    socket.setEncoding("hex");
    const client = `${socket.remoteAddress}:${socket.remotePort}`;
    socket.on("data", data => {
        const parsed__ = parser(data);
        if (
            parsed__ &&
            parsed__.length > 0 &&
            parsed__[0] &&
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
            const parsed = parsed__.map(k => Object.assign({}, k, { imei }));
            if (imei) {
                helpers.data_middleware(parsed);
            }
            if (parsed__[0].output)
                socket.write(
                    Buffer.from(
                        parsed[0].output
                        .match(/.{2}/g)
                        .map(i => parseInt(i, 16))
                    )
                );
        } else helpers.send_invalid_data_to_api(data);
    });
    socket.on("error", err => {
        console.error({ event: "error", err, remoteAddress: socket.remoteAddress });
    });
    socket.on("close", () => {
        helpers.imei_manager.delete(socket.remoteAddress, socket.remotePort)
        console.info({ event: "close", remoteAddress: socket.remoteAddress });
    });
    socket.setTimeout(10000, () => {
        console.log('Socket Timeout', socket.remoteAddress);
        socket.destroy();
    });
    socket.on("end", () => {
        helpers.imei_manager.delete(socket.remoteAddress, socket.remotePort)
        console.info({ event: "end", remoteAddress: socket.remoteAddress });
    });
});
server.on("error", err => {
    console.error({ event: "Server error", err });
});
server.on("close", err => {
    console.log({ event: "Server close", err });
});


server.listen(config.CONCOX_TCP_PORT, () => {
    console.error({
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