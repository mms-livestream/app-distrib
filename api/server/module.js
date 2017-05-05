/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

let fs = require("fs");
let express = require("express");
let Infiniteloop = require('infinite-loop');
let period = 5;

module.exports = options => {
  let service = options.service;
  let router = express.Router();

  router.put("/content/:contentId/:quality/:segment", function(req, res) {
    console.log("Post rcv !");
    var contentId = req.params.contentId;
    var bitrate = req.params.quality;
    var segment = req.params.segment;

    console.log(contentId + "/" + bitrate + "/" + segment);
    // Directory
    if (!fs.existsSync(contentId)) {
      fs.mkdirSync(contentId);
    }
    if (!fs.existsSync(contentId + "/" + bitrate)) {
      fs.mkdirSync(contentId + "/" + bitrate);
    }
    // Create file
    var stream = req.pipe(
      fs.createWriteStream(contentId + "/" + bitrate + "/" + segment)
    );
    stream.on("finish", function() {
      res.end();
    });
  });

  router.put("/mp4/:contentId/:quality/:segment", function(req, res) {
    console.log("Post rcv !");
    var contentId = req.params.contentId;
    var bitrate = req.params.quality;
    var segment = req.params.segment;

    console.log(contentId + "/" + bitrate + "/" + segment);
    // Directory
    if (!fs.existsSync(contentId)) {
      fs.mkdirSync(contentId);
    }
    if (!fs.existsSync(contentId + "/" + bitrate)) {
      fs.mkdirSync(contentId + "/" + bitrate);
    }
    // Create file
    var stream = req.pipe(
      fs.createWriteStream(contentId + "/" + bitrate + "/" + segment)
    );
    stream.on("finish", function() {
      res.end();
    });
  });
  
  let loopCPU = new Infiniteloop();
  loopCPU.add(options.toolbox.getCPU, []);
  loopCPU.setInterval(2000);
  loopCPU.run();
  /*
  let loopBW = new Infiniteloop();
  loopBW.add(options.toolbox.getBandwidth, []);
  loopBW.setInterval(period*1000);
  loopBW.run();*/

  router.timeout = 100000000;
  return router;
};
