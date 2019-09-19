const server = require("net").createServer();
const parser = require("./parser");
const config = require("../config");
const mqtt_publisher = require("../mqtt_publisher");
const helpers = require("./helpers.js");

server.on("connection", socket => {
    socket.setEncoding("hex");
    const client = `${socket.remoteAddress}:${socket.remotePort}`;
    console.info({ event: "connection", client });
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
                    socket.remoteAddress
                ) :
                helpers.imei_manager.get(
                    socket.remoteAddress
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
        console.error({ event: "error", err, client });
    });
    socket.on("close", () => {
        helpers.imei_manager.delete(socket.remoteAddress)
        console.info({ event: "close", client });
    });
    socket.on("end", () => {
        helpers.imei_manager.delete(socket.remoteAddress)
        console.info({ event: "end", client });
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