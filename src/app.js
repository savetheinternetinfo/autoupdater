"use strict";

// Dependencies
let express = require("express");
let bodyParser = require("body-parser");

// Utils
let conf = require("./utils/configurator");
let log = require("./utils/logger");

const appname = conf.getName();
const version = conf.getVersion();

let splashPadding = 12 + appname.length + version.toString().length;

console.log(
    "\n" +
    ` #${"-".repeat(splashPadding)}#\n` +
    ` # Started ${appname} v${version} #\n` +
    ` #${"-".repeat(splashPadding)}#\n\n`
);

let app = express();
log.info("Started...");

const config = conf.getConfig();

const appPort = config.port || 3000;

if (!config.port) log.warn("No port specified. Using default: 3000");

if (appPort < 1 || appPort > 65535){
    log.error(`Invalid port specified: ${appPort}\nStopping...`);
    process.exit(1);
}

app.set("port", appPort);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

require("./hooks")(app);

process.on("unhandledRejection", function(err, promise){
    log.error(`Unhandled rejection (promise: ${promise}, reason: ${err})`);
});

app.listen(app.get("port"), (err) => {
    if (err){
        log.error(`Error on port ${app.get("port")}: ${err}`);
        process.exit(1);
    }
    log.info(`Listening on port ${app.get("port")}...`);
});
