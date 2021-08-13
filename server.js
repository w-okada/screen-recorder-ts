// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */
const compression = require('compression');
const fs = require('fs');
const url = require('url');
const uuid = require('uuid');
// const AWS = require('aws-sdk');
// const config = require('./config');

/* eslint-enable */

let hostname = '0.0.0.0';
let port = 8888;
let protocol = 'https';
var ssl_server_key = 'server.key';
var ssl_server_crt = 'server.crt';
let options = {
    key: fs.readFileSync(ssl_server_key),
    cert: fs.readFileSync(ssl_server_crt)
};

const meetingCache = {};
const attendeeCache = {};

const log = message => {
    console.log(`${new Date().toISOString()} ${message}`);
};

const server = require(protocol).createServer(options, async (request, response) => {
    log(`${request.method} ${request.url} BEGIN`);
    compression({})(request, response, () => { });
    try {
        if (request.method === 'GET') {
            console.log(request.url)
            if (request.url.endsWith(".js")) {
                response.setHeader('Content-Type', 'application/javascript');
            } else if (request.url.endsWith(".css")) {
                response.setHeader('Content-Type', 'text/css');
            } else if (request.url.endsWith(".ico")) {
                response.setHeader('Content-Type', 'image/x-icon');
            } else if (request.url.endsWith(".png")) {
                response.setHeader('Content-Type', 'image/png');
            } else if (request.url.endsWith(".svg")) {
                response.setHeader('Content-Type', 'image/svg+xml');
            } else {
                response.setHeader('Content-Type', 'text/html');
            }

            response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            response.statusCode = 200;
            if (request.url === '/' || request.url.startsWith('/?')) {
                response.end(fs.readFileSync(`build/index.html`));
            } else {
                response.end(fs.readFileSync(`build${request.url}`));
            }
        }
    } catch (err) {
        log(`server caught error: ${err}`);
        response.statusCode = 403;
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify({ error: err.message }), 'utf8');
        response.end();
    }
log(`${request.method} ${request.url} END`);
});

server.listen(port, hostname, () => {
    log(`server running at ${protocol}://${hostname}:${port}/`);
});
