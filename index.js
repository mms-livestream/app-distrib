/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

//Dependencies


var express = require("express");
var fs = require('fs');
let core = require("mms-core");
let Promise = require("bluebird"); //jshint ignore:line

let serverAPI = require("./api/server/module.js");
let serviceAPI = require("./api/server/module.js");


//let app = express();


class Distrib {
  constructor() {
    this.node = "NODE_DISTRIB";
    this.service = new core.Service(this.node, serviceAPI);
    this.server = new core.Server(this.node, serverAPI, {
      service: this.service,
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

