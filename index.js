/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

//Dependencies


var express = require("express");
var fs = require('fs');
let core = require("mms-core");
let Promise = require("bluebird"); //jshint ignore:line
//let exec = require("child_process").exec;

let serverAPI = require("./api/server/module.js");
let serviceAPI = require("./api/server/module.js");


//let app = express();

/*function getCPU() {
  var childLAVG = exec ("cat /proc/loadavg | cut -d ' ' -f 1", function(errLAVG, stdoutLAVG, stderrLAVG) {
     var childProc = exec (`grep "model name" /proc/cpuinfo | wc -l`, function(errProc, stdoutProc, stderrProc) {
        console.log("stdout proc: " + stdoutProc);
        console.log("stdout lavg: " + stdoutLAVG);
	var cpuUse = 100*stdoutLAVG/stdoutProc;
	console.log("CPU(%): " + cpuUse);
	//TODO: SEND TO DATABASE CONTROLLER
     });
  });
}*/

class Distrib {
  constructor() {
    this.node = "NODE_DISTRIB";
    this.service = new core.Service(this.node, serviceAPI);
    this.server = new core.Server(this.node, serverAPI, {
      service: this.service,
      //toolbox: {getCPU: getCPU}
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

