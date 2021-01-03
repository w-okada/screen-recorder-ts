// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */
const compression = require('compression');
const fs = require('fs');
const url = require('url');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const config = require('./config');

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

const chime = new AWS.Chime({ region: 'us-east-1', credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } } );
const alternateEndpoint = process.env.ENDPOINT;
if (alternateEndpoint) {
  console.log('Using endpoint: ' + alternateEndpoint);
  chime.createMeeting({ ClientRequestToken: uuid() }, () => { });
  AWS.NodeHttpClient.sslAgent.options.rejectUnauthorized = false;
  chime.endpoint = new AWS.Endpoint(alternateEndpoint);
} else {
  chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');
}

console.log(chime.endpoint)
const meetingCache = {};
const attendeeCache = {};

const log = message => {
  console.log(`${new Date().toISOString()} ${message}`);
};

const server = require(protocol).createServer(options, async (request, response) => {
  log(`${request.method} ${request.url} BEGIN`);
  compression({})(request, response, () => { });
  try {
    if(request.url.startsWith('/attendee?')){
      if(request.method === 'GET'){
        const query = url.parse(request.url, true).query;
        const attendeeInfo = {
          AttendeeInfo: {
            AttendeeId: query.attendee,
            Name: attendeeCache[query.title][query.attendee],
          },
        };
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(attendeeInfo), 'utf8');
        response.end();
        log(JSON.stringify(attendeeInfo, null, 2));      
      }
    }else if(request.url.startsWith('/end?')){
      if(request.method === 'GET'){
      }else if (request.method === 'POST'){
        const query = url.parse(request.url, true).query;
        const title = query.title;
        await chime
          .deleteMeeting({
            MeetingId: meetingCache[title].Meeting.MeetingId,
          })
          .promise();
        meetingCache[title] = undefined
        response.statusCode = 200;
        response.end();
  
      }
    }else if(request.url.startsWith('/join?')){
      if(request.method === 'GET'){
      }else if (request.method === 'POST'){
        const query = url.parse(request.url, true).query;
        const title = query.title;
        const userName = query.userName;
  
        const res = await chime.listMeetings().promise();
  
        let meeting_exists = false
  
  
        console.log("res:",res)
        console.log("cache:",meetingCache)
        for (let i = 0; i < res.Meetings.length; i++) {
          if(!meetingCache[title]){
            break
          }
          if (meetingCache[title].Meeting.MeetingId === res.Meetings[i].MeetingId) {
            meeting_exists = true
          }
        }
  
        if (!meeting_exists) {
          console.log("Create New Meeting: "+title)
          meetingCache[title] = await chime
            .createMeeting({
              ClientRequestToken: uuid.v4(),
            })
            .promise();
          attendeeCache[title] = {};
        }else{
          console.log("Meeting "+title+" exists")
        }
        const joinInfo = {
          JoinInfo: {
            Title: title,
            Meeting: meetingCache[title].Meeting,
            Attendee: (
              await chime
                .createAttendee({
                  MeetingId: meetingCache[title].Meeting.MeetingId,
                  ExternalUserId: uuid.v4(),
                })
                .promise()
            ).Attendee,
          },
        };
        attendeeCache[title][joinInfo.JoinInfo.Attendee.AttendeeId] = userName;
        joinInfo.userName=userName
        response.statusCode = 201;
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(joinInfo), 'utf8');
        response.end();
        log(JSON.stringify(joinInfo, null, 2));        
      }
    } else{
      if(request.method === 'GET'){
        console.log(request.url)
        if(request.url.endsWith(".js")){
          response.setHeader('Content-Type', 'application/javascript');
        }else if(request.url.endsWith(".css")){
          response.setHeader('Content-Type', 'text/css');
        }else if(request.url.endsWith(".ico")){
          response.setHeader('Content-Type', 'image/x-icon');
        }else if(request.url.endsWith(".png")){
          response.setHeader('Content-Type', 'image/png');
        }else if(request.url.endsWith(".svg")){
          response.setHeader('Content-Type', 'image/svg+xml');
        }else{
          response.setHeader('Content-Type', 'text/html');
        }
        response.statusCode = 200;
        if (request.url === '/' || request.url.startsWith('/?')) {
          response.end(fs.readFileSync(`build/index.html`));
        } else {
          response.end(fs.readFileSync(`build${request.url}`));
        }
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
