/*jslint node: true */
/*jshint esversion: 6 */
"use strict";

let fs = require("fs");
let express = require("express");

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

  return router;
};
