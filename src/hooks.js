"use strict";

// Core modules
let exec = require("child_process").exec;

// Utils
let conf = require("./utils/configurator");
let log = require("./utils/logger");
let verifyRequest = require("./utils/verifyRequest");

/**
 * CLI command executor
 *
 * @param {*} env
 * @param {*} callback
 */
let executor = function(env, callback){
    let command = "cd " + config[env].repository_path;
    for (let nextCommand of config[env].commands) command += " && " + nextCommand;
    exec(command, function(err, stdout, stderr){
        callback(...arguments);
    });
};

let config = conf.getConfig();

/**
 * Main hook function
 *
 * @param {*} app - ExpressJS object
 */
module.exports = function(app){
    // Live Deployment
    app.post(config.live.hook.path, (req, res) => {
        let response = verifyRequest(req, config.live.hook.secret);
        if (!response.valid) return log.error(response.error);

        executor("live", function(err, stdout, stderr){
            if (err || stderr){
                if (err) log.error(`Exec Error on Live: ${err}`);
                if (stderr) log.error(`Exec STDERR on Live: ${stderr}`);
                return;
            }

            // TODO: PM2 STUFF
        });
    });

    // Dev Deployment
    app.post(config.dev.hook.path, (req, res) => {
        let response = verifyRequest(req, config.live.hook.secret);
        if (!response.valid) return log.error(response.error);

        executor("dev", function(err, stdout, stderr){
            if (err || stderr){
                if (err) log.error(`Exec Error on Dev: ${err}`);
                if (stderr) log.error(`Exec STDERR on Dev: ${stderr}`);
                return;
            }

            // TODO: PM2 STUFF
        });
    });
};
