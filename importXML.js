var path = require('path');
var fs = require('fs');
var parser = require('xml2json');

var file = process.argv[2];

var filePath = path.join(__dirname, 'xml', file);
var locationsPath = path.join(__dirname, 'locations.json');

var credentials = require('./credentials.json');
var dbPassword = credentials.dbPass;

const dbURI = 'mongodb://henry:'+dbPassword+'@ds061374.mlab.com:61374/locator';
const db = require('monk')(dbURI);
const locations = db.get('locations');

function addEntry(data, end){
  locations.insert(data,{},(err, doc) => {
    if(end){
      db.close();
    }
  });
}
if(file){
  var room = file.slice(0, -4);
  fs.readFile(filePath, (err,data) => {
    if(!err){
      var collection = db.collection('locations');
      var xml = data;
      var json = JSON.parse(parser.toJson(xml));
      var i = 1;
      var len = json.wifiScanResults.scanResult.length;
      for(var ap of json.wifiScanResults.scanResult){
        addEntry({macAddress: ap.BSSID, location: room}, i === len);
        i++;
      }
    } else {
      console.error(err);
    }
  });
} else {
  
}
