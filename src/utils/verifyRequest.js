"use strict";

// Core Modules
let crypto = require("crypto");

// Dependencies
let bufferEq = require("buffer-equal-constant-time");

/**
 * Return signed response
 *
 * @param {*} secret
 * @param {*} data
 * @returns {string} signed response
 */
let signData = function(secret, data){
    return "sha1=" + crypto.createHmac("sha1", secret).update(data).digest("hex");
};

/**
 * Check githubs response against config specified hook secret
 *
 * @param {*} secret
 * @param {*} data
 * @param {*} signature
 * @returns {boolean} Buffer timestamp equal
 */
let verifySignature = function(secret, data, signature){
    return bufferEq(new Buffer(signature), new Buffer(signData(secret, data)));
};

/**
 * Verify signature and headers of hook-call
 *
 * @param {*} req
 * @param {*} secret
 * @returns {object} Valid request
 */
let verifyRequest = function(req, secret){
    let response = {
        valid: false,
        error: ""
    };

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

    let reqData = JSON.stringify(req.body);
    if (!verifySignature(secret, reqData, sign)){
        response.valid = false;
        response.error += "Failed to verify signature\n";
    }

    return response;
};

module.exports = verifyRequest;
