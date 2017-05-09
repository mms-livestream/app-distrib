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
let child, child2, child3;
let bitrate;
let maxBitrate = 10;
var tmp;
let period = 1000; //30 secondes for the first loopBW
let send;

let serverAPI = require("./api/server/module.js");
let serviceAPI = require("./api/server/module.js");

let app = express();

//Compute the maxBitrate
child2 = exec("speedtest-cli | grep 'Upload:' | cut -c9-13", function(error2, stdout2, stderr2) {
  maxBitrate = stdout2;
  console.log(maxBitrate);
});

//Seek for the @IP
child3 = exec("hostname -I", function(error3, stdout3, stderr3) {
  //send = JSON.stringify(stdout3).pipe(request.put('http://@IP' +"/api/????));
});

//Seek for the uploading datas to set
child = exec("cat /sys/class/net/wlo1/statistics/tx_bytes",function(error,stdout,stderr) {
    tmp = stdout;
});

// Executes `cat /sys/class/net/wlo1/statistics/tx_bytes`
function getBandwidth() {
  var childBand = exec("cat /sys/class/net/wlo1/statistics/tx_bytes",function(error,stdout,stderr) {
    bitrate = (stdout - tmp)/1;
    let diff = stdout-tmp;
    //console.log('TX Bytes = ' + bitrate + '\n');
    tmp = stdout;
    console.log('Biterate = ' + (8*bitrate)/(maxBitrate*10000) + '\n');
    //send = JSON.stringify(bitrate/maxBitrate*10000).pipe(request.put('http://@IP' +"/api/????));
  });
}

// Executes `cat /proc/loadavg | cut -d ' ' -f 1`
function getCPU() {
  var childLAVG = exec ("cat /proc/loadavg | cut -d ' ' -f 1", function(errLAVG, stdoutLAVG, stderrLAVG) {
    var childProc = exec (`grep "model name" /proc/cpuinfo | wc -l`, function(errProc, stdoutProc, stderrProc) {
	     var cpuUse = 100*stdoutLAVG/stdoutProc;
       console.log("Proc: " + stdoutLAVG);
       console.log("CPU(%): " + cpuUse);
	//send = JSON.stringify(cpuUse).pipe(request.put('http://@IP' +"/api/????));
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

  /*console.log(cpt);
  if (cpt == 0) {
    loopBW.setInterval(period*1000);
  } else {
    loopBW.setInterval(period*30000);
  }
  loopBW.run();*/

  /*let loopCPU = new Infiniteloop();
  loopCPU.add(getCPU, []);
  loopCPU.setInterval(period*1000);
  loopCPU.run();
  */
});
