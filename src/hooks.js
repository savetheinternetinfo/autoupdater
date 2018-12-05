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
let pm2Handler = function(scriptName, scriptPath, workingDir, env){
    pm2.delete(scriptName, (delErr) => {
        if (delErr) log.warn("Script is not running - No process needs to be terminated.");
        else log.info("Script has been stopped.");

        let startOptions = {
            name: scriptName,
            script: scriptPath,
            cwd: workingDir
        };
        pm2.start(startOptions, (startErr) => {
            if (startErr) return log.error(`PM2 Start Error for ${env} on script ${scriptName} at ${scriptPath}: ${startErr}`);
            return log.done(`Started script ${scriptName} on ${env} at ${scriptPath}`);
        });
    });
};

let deployer = function(env){
    executor(env, (err) => {
        if (err) return log.error(`Exec Error on ${env}: ${err}`);
        log.done(`Executed CLI commands for ${env} successfully`);

        pm2Handler(config[env].pm2_process_name, config[env].script_path, config[env].repository_path, env);
    });
};

/**
 * Deployment routine
 *
 * @param {*} env
 * @param {*} req
 * @returns on error
 */
let launcher = function(env, req){
    log.info(`Got build request for ${env}`);

    if (!config[env].enabled) return log.warn("Live hook is disabled");

    let response = verifyRequest(req, config[env].hook.secret);
    if (!response.valid){
        for (let errMsg of response.errors) log.error(errMsg);
        return;
    }

    log.done(`Request for ${env} is valid!`);
    deployer(env);
};

/**
 * Main hook function
 *
 * @param {*} app - ExpressJS object
 */
module.exports = function(app){
    if (config.live.execute_on_startup && config.live.enabled){
        let env = "live";
        log.info(`Initial launch of script for ${env}`);
        deployer(env);
    }

    if (config.dev.execute_on_startup && config.dev.enabled){
        let env = "dev";
        log.info(`Initial launch of script for ${env}`);
        deployer(env);
    }

    // Live Deployment
    app.post(config.live.hook.path, (req, res) => {
        launcher("live", req);
    });

    // Dev Deployment
    app.post(config.dev.hook.path, (req, res) => {
        launcher("dev", req);
    });
};
