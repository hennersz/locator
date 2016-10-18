var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);

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
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended:false }));
app.use(express.static('public'));

var location = 'offline';
var lastUpdate;

app.get('/', function(req,res){
  res.render('location', {location: location});
});

app.get('/push.min.js', function(req, res){
  res.sendFile(path.join(__dirname+'/push.min.js'));
})

app.get('/notification', function(req, res) {
  res.sendFile(path.join(__dirname+'/notifications.html'));
});

app.post('/', function (req, res) {
  console.log(typeof(req.body.macAddress));
  locations.findOne({macAddress: req.body.macAddress}).then((doc) => {
    var prevLoc = location;
    if(doc === null){
      location = 'unknown';
    } else {
      location = doc.location;
    }
    if(prevLoc !== location){
      io.emit('locationUpdated', {location: location, user: 'Henry'});
    }
    console.log('here');
  });
  lastUpdate = new Date();
  setTimeout(function(){
    var timeNow = new Date();
    if(timeNow - lastUpdate > 900000){
      location = 'offline';
    }
  }, 900000);
  res.end();
});

io.on('connection', function(socket){
    console.log('a user connected');
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


server.listen(port, function () {
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
