var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var environment = process.env.NODE_ENV || 'development';
if(environment === "development"){
  var credentials = require('./credentials.json');
  var dbPassword = credentials.dbPass;
}else{
  var dbPassword = process.env.DBPASS
}
const dbURI = 'mongodb://henry:'+dbPassword+'@ds061374.mlab.com:61374/locator';
const db = require('monk')(dbURI);
const locations = db.get('locations');

locations.index({macAddress: 1}, {unique: true});

var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);
app.use(bodyParser.urlencoded({ extended:false }));

var location = 'offline';
var lastUpdate;

app.get('/', function(req,res){
  res.json({
    location: location
  });
});

app.post('/', function (req, res) {
  console.log(req.body.macAddress);
  locations.findOne({macAddress: req.body.macAddress}).then((doc) => {
    console.log(doc);
    if(doc === null){
      location = 'unknown';
    } else {
      location = doc.location;
    }
  })
  lastUpdate = new Date().now()/1000;
  res.end();
});

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    'status': res.status,
    'message': err.message,
  });
});


app.listen(port, function () {
	console.log('Listening on port ' + port);
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
