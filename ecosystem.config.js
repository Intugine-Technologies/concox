module.exports = {
    apps: [{
        name: "TCP Server",
        script: "./tcp/index.js",
        out_file: "/dev/null",
        error_file: "/dev/null"
    }, {
        name: "API Server",
        script: "./api/index.js",
        out_file: "/dev/null",
        error_file: "/dev/null"
    }]
}