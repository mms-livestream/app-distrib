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
let child1, child2, child3;
let bitrate;
let maxBitrate = 10;
var tmp;
let period = 1000; //30 secondes for the first loopBW
let send;

let serverAPI = require("./api/server/module.js");
let serviceAPI = require("./api/server/module.js");

let app = express();

//Seek for the uploading datas to set
child1 = exec("cat /sys/class/net/enp0s3/statistics/tx_bytes",function(error,stdout,stderr) {
  tmp = stdout;
});

//Compute the maxBitrate
child2 = exec("speedtest-cli | grep 'Upload:' | cut -c9-13", function(errorST, stdoutST, stderrST) {
  maxBitrate = stdoutST;
});

//Seek for the @IP
child3 = exec("hostname -I", function(errorIP, stdoutIP, stderrIP) {
  send = JSON.stringify(stdoutIP).pipe(request.put('http://localhost:8081' + '/api/servers/load'));
});

//Executes `cat /sys/class/net/wlo1/statistics/tx_bytes`
function getBandwidth() {
  var childBand = exec("cat /sys/class/net/enp0s3/statistics/tx_bytes",function(error,stdout,stderr) {
    bitrate = (stdout - tmp)/(period/1000);
    tmp = stdout;
    var res = (100*8*bitrate)/(1000000*maxBitrate);
    if( res <= 100 ) {
	     send = JSON.stringify(bitrate/maxBitrate*10000).pipe(request.put('http://localhost:8081' + '/api/servers/load'));
    }
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
