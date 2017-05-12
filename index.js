/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

//Dependencies

var express = require("express");
var fs = require('fs');
let core = require("mms-core");
let Promise = require("bluebird"); //jshint ignore:line
let exec = require("child_process").exec;
let request = require("request");
let Infiniteloop = require('infinite-loop');
let info; // Json containing ipAdress and uploading bitrate
let child1, child2, child3;
let bitrate;
let maxBitrate = 10;
let ipAddress;
var tmp;
let period = 5000; //30 secondes for the first loopBW
let cpt = 0; // To show "OK sent" only once
let dest = core.dConfig["NODE_DB_CONTROLLER"].server.host + ':' + core.dConfig["NODE_DB_CONTROLLER"].server.port;

let serverAPI = require("./api/server/module.js");
let serviceAPI = require("./api/server/module.js");

let app = express();

//Seek for the uploading datas to set
child1 = exec("cat /sys/class/net/wlo1/statistics/tx_bytes",function(error,stdout,stderr) {
  tmp = stdout;
});

//Compute the maxBitrate
child2 = exec("speedtest-cli | grep 'Upload:' | cut -c9-13", function(errorST, stdoutST, stderrST) {
  maxBitrate = stdoutST;
  // console.log(maxBitrate);
});

//Seek for the @IP
child3 = exec("hostname -I | cut -c1-13 | tr -d '\n'", function(errorIP, stdoutIP, stderrIP) {
  ipAddress = stdoutIP;
});

//Executes `cat /sys/class/net/wlo1/statistics/tx_bytes`
function getBandwidth() {
  var childBand = exec("cat /sys/class/net/wlo1/statistics/tx_bytes",function(error,stdout,stderr) {
    bitrate = (stdout - tmp)/(period/1000);
    tmp = stdout;
    var res = Math.round((100*8*bitrate)/(1000000*maxBitrate));
    if( res <= 100 ) {
      bitrate = res;
    } else {
      bitrate = 100;
    }
    let info = {"ipAddress": ipAddress, "bitrate":bitrate};
    let options = {
      url: `http://${dest}/api/servers/load`,
      method: 'POST',
      json: true,
      headers: {
           'Content-Type': 'application/json'
      },
      body: info
    };
    // console.log(options.body.ipAddress);
    //Do request
    request(options, function(err, res) {
      if (!err && res.statusCode === 200) {
        if (cpt == 0) {
          console.log("OK sent");
          cpt = 1;
        }
      } else {
        console.log("Error:" + err);
      }
    });
  });
}

class Distrib {
  constructor() {
    this.node = "NODE_DISTRIB";
    this.service = new core.Service(this.node, serviceAPI);
    this.server = new core.Server(this.node, serverAPI, {
      service: this.service
    });
    //this.server.timeout = 100000000;
  }

}

//Main

let distrib = new Distrib();

distrib.server.listen()
.then((listeningServer) => {
  //console.log(listeningServer);
  listeningServer.timeout = 100000000;
}).then(() => {
  let loopBW = new Infiniteloop();
  loopBW.add(getBandwidth, []);
  loopBW.setInterval(period);
  loopBW.run();
});
