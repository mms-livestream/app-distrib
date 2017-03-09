var fs = require('fs');
var express = require('express');
var app = express();

app.put('/api/content/:contentId/:quality/:segment', function(req, res) {
  console.log("Put rvc !");
  var contentId = req.params.contentId;
  var bitrate = req.params.quality;
  var segment = req.params.segment;

  console.log(contentId+"/"+bitrate+"/"+segment);
  // Directory
  if (!fs.existsSync(contentId)){
      fs.mkdirSync(contentId);
  }
  if (!fs.existsSync(contentId+"/"+bitrate)){
      fs.mkdirSync(contentId+"/"+bitrate);
  }
  // Create file
  var stream = req.pipe(fs.createWriteStream(contentId+"/"+bitrate+"/"+segment));
  stream.on('finish', function() {
    res.end();
  })
});


app.listen(8081);
console.log("Serveur web lancé sur localhost:8081 ...");

// if (!fs.existsSync(dir)){
//     fs.mkdirSync(dir);
// }
