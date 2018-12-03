"use strict";

// Core modules
let exec = require("child_process").exec;

// Utils
let conf = require("./utils/configurator");
let log = require("./utils/logger");

let puts = function(err, stdout, stderr){
    if (err) return log.error(err);
    log.info(stdout);
};

let executor = function(env){
    let command = "cd " + config[env].repository_path;
    for (let nextCommand of config[env].commands) command += " && " + nextCommand;
    exec(command, puts);
};

let config = conf.getConfig();

module.exports = function(app){ 
    app.get("/livehook", (req, res) => {
        // ...
    });

    app.get("/devhook", (req, res) => {
        // ...
    });
};
