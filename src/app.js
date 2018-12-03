"us strict";

let http       = require("http");
let path       = require("path");
let exec       = require("child_process").exec;
let initHandle = require("node-github-webhook");

global.approot = path.join(__dirname, "..")

let conf = require("./utils/configurator");
let log  = require("./utils/logger");

const appname = conf.getName();
const version = conf.getVersion();

console.log(
    "\n" +
    " #" + "-".repeat(12 + appname.length + version.toString().length) + "#\n" +
    " # Started " + appname + " v" + version + " #\n" +
    " #" + "-".repeat(12 + appname.length + version.toString().length) + "#\n"
);

log("Started...");
const config  = conf.getConfig();

let handler = initHandle({ 
    path: config.hook.path, 
    secret: config.hook.secret 
});

http.createServer(function(req, res){
    handler(req, res, function(err){
        res.statusCode = 404;
        log("Got invalid path", true);
        res.end("Invalid path");
  })
}).listen(config.port);

handler.on("error", function(err){ log(err.message, true); });

handler.on("push", function(event){
    log(`Got push for ${event.payload.repository.name} to ${event.payload.ref}`);
    if (event.path == config.hook.path){
        let command = "cd " + config.absolute_repository_path;
        for (let i in config.commands_to_execute) command += " && " + config.commands_to_execute[i];
        exec(command, puts);
    }
});

function puts(err, stdout, stderr){
    if (err) return log(err, true);
    log(stdout);
}
