var path = require('path');
var fs = require('fs');
var parser = require('xml2json');

var file = process.argv[2];
var room = file.slice(0, -4);

var filePath = path.join(__dirname, 'xml', file);
var locationsPath = path.join(__dirname, 'locations.json');

var locations = require('./locations.json');

fs.readFile(filePath, function(err,data){
  if(!err){
    var xml = data;
    var json = JSON.parse(parser.toJson(xml));
    console.log(typeof(json));
    console.log(json.wifiScanResults);
    for(var ap of json.wifiScanResults.scanResult){
      locations.push({
        macAddress: ap.BSSID,
        location: room
      });
    }   
    fs.writeFile(locationsPath, JSON.stringify(locations),function(err){
      if(err) console.error(err);
    });
  } else {
    console.error(err);
  }
})