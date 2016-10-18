var path = require('path');
var fs = require('fs');
var parser = require('xml2json');

var file = process.argv[2];
var opt = process.argv[3];

if(opt){
  var filePath = path.join(__dirname, 'xml', file+'.xml');
}

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
if(opt){
  fs.readFile(filePath, (err,data) => {
    if(!err){
      var xml = data;
      var json = JSON.parse(parser.toJson(xml));
      var i = 1;
      var len = json.wifiScanResults.scanResult.length;
      for(var ap of json.wifiScanResults.scanResult){
        addEntry({macAddress: ap.BSSID, location: file}, i === len);
        i++;
      }
    } else {
      console.error(err);
    }
  });
} else {
	var exec = require('child_process').exec;
	exec("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s -x", function (error, stdout, stderr) {
    var xml = stdout;
    var json = JSON.parse(parser.toJson(xml));
    var i = 1;
    var len = json.plist.array.dict.length;
    for(var ap of json.plist.array.dict){
      addEntry({macAddress: ap.string[0], location: file}, i === len);
      i++;
    }
		if (error !== null) {
			console.log('exec error: ' + error);
    }
	}); 
}
