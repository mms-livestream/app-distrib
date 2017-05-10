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
let info = fs.createWriteStream('info.json'); // Json containing ipAdress and uploading bitrate
let child1, child2, child3;
let bitrate;
let maxBitrate = 10;
var tmp;
let period = 1000; //30 secondes for the first loopBW
let send;
let dest = core.dConfig["NODE_DB_CONTROLLER"].service.host + ':' + core.dConfig["NODE_DB_CONTROLLER"].service.port;

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
  console.log(maxBitrate);
});

//Seek for the @IP
child3 = exec("hostname -I", function(errorIP, stdoutIP, stderrIP) {
  info.ipAddress = stdoutIP;
  // send = fs.createReadStream('./info.json').pipe(request.put('http://' + dest + '/api/servers/load'));
});

//Executes `cat /sys/class/net/wlo1/statistics/tx_bytes`
function getBandwidth() {
  var childBand = exec("cat /sys/class/net/wlo1/statistics/tx_bytes",function(error,stdout,stderr) {
    bitrate = (stdout - tmp)/(period/1000);
    tmp = stdout;
    var res = Math.round((100*8*bitrate)/(1000000*maxBitrate));
    if( res <= 100 ) {
      info.bitrate = res;
    } else {
      info.bitrate = 100;
    }
    console.log(info.ipAdress + ' ' + info.bitrate);
    send = fs.createReadStream('./info.json').pipe(request.put('http://' + dest + '/api/servers/load'));
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
