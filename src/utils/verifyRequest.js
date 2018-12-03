"use strict";

// Core Modules
let crypto = require("crypto");

// Dependencies
let bufferEq = require("buffer-equal-constant-time");

let signData = function(secret, data){
    return `sha1=${crypto.createHmac("sha1", secret).update(data).digest("hex")}`;
};

let verifySignature = function(secret, data, signature){
    return bufferEq(new Buffer(signature), new Buffer(signData(secret, data)));
};

let verifyRequest = function(req, secret){
    let response = {};

    if (!req.headers["x-github-delivery"]){
        response.valid = false;
        response.error += "No id found in the request\n";
    }

    if (!req.headers["x-github-event"]){
        response.valid = false;
        response.error += "No event found in the request\n";
    }

    let sign = req.headers["x-hub-signature"] || "";
    if (!sign){
        response.valid = false;
        response.error += "No signature found in the request\n";
    }

    if (secret && !verifySignature(secret, JSON.stringify(req.body), sign)){
        response.valid = false;
        response.error += "Failed to verify signature\n";
    }

    else {
        response.valid = true;
        response.error = null;
    }

    return response;
};

module.exports = verifyRequest;
