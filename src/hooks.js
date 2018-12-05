"use strict";

// Core modules
let exec = require("child_process").exec;

// Dependencies
let pm2 = require("pm2");

// Utils
let conf = require("./utils/configurator");
let log = require("./utils/logger");
let verifyRequest = require("./utils/verifyRequest");

let config = conf.getConfig();

pm2.connect((err) => {
    if (err) log.error(err);
});

/**
 * CLI command executor
 *
 * @param {*} env
 * @param {*} callback
 */
let executor = function(env, callback){
    log.info(`Executing CLI commands for ${env}`);

    let command = "cd " + config[env].repository_path;
    for (let nextCommand of config[env].commands) command += " && " + nextCommand;
    exec(command, (err, stdin) => {
        callback(err, stdin);
    });
};

/**
 * Stop and start the node script
 *
 * @param {*} scriptName
 * @param {*} env
 * @param {*} scriptPath
 */
let pm2Handler = function(scriptName, env, scriptPath){
    pm2.delete(scriptName, (delErr) => {
        if (delErr) log.warn("Script is not running - No process needs to be terminated.");
        else log.info("Script has been stopped.");

        let startOptions = {
            name: scriptName,
            script: scriptPath
        };
        pm2.start(startOptions, (startErr) => {
            if (startErr) return log.error(`PM2 Start Error for ${env} on script ${scriptName} at ${scriptPath}: ${startErr}`);
            return log.done(`Started script ${scriptName} on ${env} at ${scriptPath}`);
        });
    });
};

/**
 * Main hook function
 *
 * @param {*} app - ExpressJS object
 */
module.exports = function(app){
    // Live Deployment
    app.post(config.live.hook.path, (req, res) => {
        log.info("Got build request for Live");

        if (!config.live.enabled) return log.warn("Live hook is disabled");

        let response = verifyRequest(req, config.live.hook.secret);
        if (!response.valid) return log.error(response.error);

        log.done("Request for Live is valid!");
        executor("live", (err) => {
            if (err) return log.error(`Exec Error on Live: ${err}`);
            log.done("Executed CLI commands for Live successfully");

            pm2Handler(config.live.pm2_process_name, "live", config.live.script_path);
        });
    });

    // Dev Deployment
    app.post(config.dev.hook.path, (req, res) => {
        log.info("Got build request for Dev");

        if (!config.dev.enabled) return log.warn("Dev hook is disabled");

        let response = verifyRequest(req, config.dev.hook.secret);
        if (!response.valid) return log.error(response.error);

        log.done("Request for Dev is valid!");
        executor("dev", (err) => {
            if (err) return log.error(`Exec Error on Live: ${err}`);
            log.done("Executed CLI commands for Dev successfully");

            pm2Handler(config.dev.pm2_process_name, "dev", config.dev.script_path);
        });
    });
};
