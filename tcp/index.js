const server = require("net").createServer();
const parser = require("./parser");
const config = require("../config");
const helpers = require("./helpers.js");
const helpers_ = require("./parser/helpers.js");
const ota_save_to_db = require("./save_ota_command_to_db.js");
const inspector = require("event-loop-inspector")();
const ota_commands = require("./ota_commands_manager.js");
const Promise = require("bluebird");
const sockets = {};
const app = require("express")();

const fetch_send_ota_commands = () => {
    ota_commands
        .members()
        .then((r) => {
            return Promise.map(
                r.filter(
                    (k) =>
                        k.imei &&
                        k.message_to_send &&
                        sockets[k.imei] &&
                        sockets[k.imei].socket.readyState === "open"
                ),
                (k) => {
                    send_ota_command(k.imei, sockets[k.imei].socket, sockets[k.imei].info_serial_no, k.message_to_send);
                    return ota_commands.remove(k);
                },
                {
                    concurrency: 5,
                }
            );
        })
        .then((r) => {})
        .catch((e) => {
            console.error(e);
        });
};

setInterval(() => {
    fetch_send_ota_commands();
}, 60000);

app.get("/inspector", (req, res) => {
    res.json(inspector.dump());
});

app.listen(9999, () => {
    console.log("Event loop inspector listening");
});

const send_ota_command = (imei, socket, serial_no, __message) => {
    // console.log("ota", imei, serial_no, __message);
    // console.log("ota", imei, __message);
    const command = helpers_.ascii_to_hex(__message);
    const server_flag_bit = "00000000";
    const length_of_command = (command.match(/.{2}/g).length + 4)
        .toString(16)
        .padStart(2, "0");
    const language = "0002";
    const serial = (serial_no + 1).toString(16).padStart(4, "0");
    const info_content =
        length_of_command + server_flag_bit + command + language;
    const data_length = (1 + info_content.match(/.{2}/g).length + 2 + 2)
        .toString(16)
        .padStart(2, "0");
    const data = data_length + "80" + info_content + serial;
    const message = helpers_.appendStartEnd(`${data}${helpers_.crc16(data)}`);
    // console.log("ota", imei, message);
    socket.write(
        Buffer.from(message.match(/.{2}/g).map((i) => parseInt(i, 16)))
    );
    ota_save_to_db([
        {
            imei,
            time: Date.now(),
            content: __message,
        },
    ]);
};

// console.log(parser("79 79 00 7F 94 04 41 4C 4D 31 3D 43 34 3B 41 4C 4D 32 3D 43 43 3B 41 4C 4D 33 3D 34 43 3B 53 54 41 31 3D 43 30 3B 44 59 44 3D 30 31 3B 53 4F 53 3D 2C 2C 3B 43 45 4E 54 45 52 3D 3B 46 45 4E 43 45 3D 46 65 6E 63 65 2C 4F 4E 2C 30 2C 32 33 2E 31 31 31 38 30 39 2C 31 31 34 2E 34 30 39 32 36 34 2C 34 30 30 2C 49 4E 20 6F 72 20 4F 55 54 2C 30 3B 4D 49 46 49 3D 4D 49 46 49 2C 4F 46 46 00 0A 06 1E 0D 0A"));
// console.log(parser("7979009f9404414c4d313d44353b414c4d323d44353b414c4d333d35373b535441313d32313b4459443d30313b534f533d2c2c3b43454e5445523d3b46454e43453d46656e63652c4f46462c302c302e3030303030302c302e3030303030302c3330302c494e206f72204f55542c313b49434349443d38393931343530393030393937393031303331343b4d4f44453d4d4f44453a312c33302c3138303b3b000780110d0a"));
// console.log(parser("78 78 48 2C 10 06 0E 02 2D 35 01 CC 00 28 7D 00 1F 71 2D 28 7D 00 1E 17 25 28 7D 00 1E 23 1E 28 00 1F 40 12 00 00 00 00 00 00 00 00 00 00 00 00 FF 02 80 89 17 44 98 B4 5C CC 7B 35 36 61 A6 5B 00 1F A0 04 0D 0A"));
// console.log(parser("78 78 11 01 07 52 53 36 78 90 02 42 70 00 32 01 00 05 12 79 0D 0A"));

server.on("connection", (socket) => {
    socket.setEncoding("hex");
    const client = `${socket.remoteAddress}:${socket.remotePort}`;
    socket.setKeepAlive(true, 50000);
    let imei = null;
    socket.on("data", (data) => {
        const parsed__ = parser(data);
        if (
            Array.isArray(parsed__) &&
            parsed__.length > 0 &&
            typeof parsed__[0] === "object" &&
            parsed__[0].case
        ) {
            imei =
                parsed__[0].case === "01"
                    ? helpers.imei_manager.set(
                          parsed__[0].imei,
                          socket.remoteAddress,
                          socket.remotePort
                      )
                    : helpers.imei_manager.get(
                          socket.remoteAddress,
                          socket.remotePort
                      );
            if (imei) {
                sockets[imei] = {
                    socket,
                    info_serial_no: parsed__[0].info_serial_no,
                };
                helpers.data_middleware(
                    parsed__.map((k) => ({
                        ...k,
                        imei,
                        socket: client,
                    }))
                );
                if (parsed__[0].tag === "Online Command") {
                    ota_save_to_db(
                        parsed__.map((k) => ({
                            ...k,
                            imei,
                            time: Date.now(),
                            socket: client,
                        }))
                    );
                }
            }
            parsed__
                .filter((k) => k.output)
                .forEach((k) => {
                    socket.write(
                        Buffer.from(
                            k.output.match(/.{2}/g).map((i) => parseInt(i, 16))
                        )
                    );
                });
        } else helpers.send_invalid_data_to_api(data.map(k => ({
            ...k,
            imei: helpers.imei_manager.get(
                          socket.remoteAddress,
                          socket.remotePort
                      ),
            socket: client
        })));
    });
    socket.on("error", (err) => {
        console.error({ event: "error", err: err.message, client });
        socket.end();
    });
    socket.on("close", () => {
        console.log({ event: "close", client });
        if (imei) delete sockets[imei];
        helpers.imei_manager.delete(client);
    });
    socket.setTimeout(1000 * 60 * 30, () => {
        console.log("Socket Timeout", client);
        if (imei) delete sockets[imei];
        helpers.imei_manager.delete(client);
        socket.end();
    });
    socket.on("end", (hadError) => {
        if (imei) delete sockets[imei];
        helpers.imei_manager.delete(client);
        console.log({ event: "end", client, hadError });
    });
});
server.on("error", (err) => {
    console.error({ event: "Server error", err });
});
server.on("close", (err) => {
    console.log({ event: "Server close", err });
});

server.listen(config.CONCOX_TCP_PORT, () => {
    console.log({
        event: "CONCOX_TCP_SERVER STARTED",
        PORT: config.CONCOX_TCP_PORT,
    });
});

process.on("unhandledRejection", (reason, promise) => {
    console.error({
        event: "Unhandled Rejection at:",
        err: reason.stack ? reason.stack.toString() : reason,
    });
});