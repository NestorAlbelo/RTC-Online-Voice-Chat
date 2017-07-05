const PORT = 3000;

var app = require('express')();
var fs = require('fs');
var https = require('https');

var options = {
    key: fs.readFileSync('ca.key'),
    cert: fs.readFileSync('ca.crt')
};

var hostKey = null;

var server = https.createServer(options, app);
var io = require('socket.io')(server);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});
app.get('/peer.js', function(req, res){
  res.sendFile(__dirname + '/peer.js');
});
app.get('/bundle.js', function(req, res){
  res.sendFile(__dirname + '/bundle.js');
});
app.get('/back.png', function(req, res){
  res.sendFile(__dirname + '/back.png');
});

io.on('connection', function(socket){
  socket.on('emitMyKey', function(key){
    if(hostKey === null) hostKey = key;
    socket.broadcast.emit("otherKey", key);
  });

  if (hostKey !== null) {
    io.emit('hostKey', hostKey);
  }else{
    io.emit('noHostKeyFound', null);
  }
});

server.listen(PORT, function() {
  console.log("My https server listening on port " + PORT + "...");
});
