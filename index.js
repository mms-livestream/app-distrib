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
let child, child2, child3;
let bitrate;
let maxBitrate = 10;
let tmp;
let period = 5;
let send;

let serverAPI = require("./api/server/module.js");
let serviceAPI = require("./api/server/module.js");

let app = express();

//Compute the maxBitrate
child2 = exec("speedtest-cli | grep 'Upload:' | cut -c9-13", function(error2, stdout2, stderr2) {
  maxBitrate = stdout2;
});

//Seek for the @IP
child3 = exec("hostname -I", function(error3, stdout3, stderr3) {	    
  //send = JSON.stringify(stdout3).pipe(request.put('http://@IP' +"/api/????));
});

//Seek for the uploading datas to set
child = exec("cat /sys/class/net/wlo1/statistics/tx_bytes",function(error,stdout,stderr) {  
    tmp = stdout;
});
/*
// Executes `cat /sys/class/net/wlo1/statistics/tx_bytes`
function getBandwidth() {
  childBand = exec("cat /sys/class/net/wlo1/statistics/tx_bytes",function(error,stdout,stderr) {      
    bitrate = (stdout - tmp)/period;
    tmp = stdout;
    console.log('bitrate = ' + bitrate/maxBitrate*10000 + '\n');
    //send = JSON.stringify(bitrate/maxBitrate*10000).pipe(request.put('http://@IP' +"/api/????));
  });
}
*/

function getCPU() {
  /*var childLAVG = exec ("cat /proc/loadavg | cut -d ' ' -f 1", function(errLAVG, stdoutLAVG, stderrLAVG) {
     var childProc = exec (`grep "model name" /proc/cpuinfo | wc -l`, function(errProc, stdoutProc, stderrProc) {
        console.log("stdout proc: " + stdoutProc);
        console.log("stdout lavg: " + stdoutLAVG);
	var cpuUse = 100*stdoutLAVG/stdoutProc;
	console.log("CPU(%): " + cpuUse);
	//send = JSON.stringify(cpuUse).pipe(request.put('http://@IP' +"/api/????));
     });
  });*/
}

class Distrib {
  constructor() {
    this.node = "NODE_DISTRIB";
    this.service = new core.Service(this.node, serviceAPI);
    this.server = new core.Server(this.node, serverAPI, {
      service: this.service,
      toolbox: {getCPU: getCPU}//, getBandwidth: getBandwidth}
    });
    //this.server.timeout = 100000000;
  }

}

//Main

let distrib = new Distrib();

distrib.server.listen()
.then( (listeningServer) => {
  //console.log(listeningServer);
  listeningServer.timeout = 100000000;
});
