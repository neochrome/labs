var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);

app.use('/', express.static(__dirname + '/public'));

io.sockets.on('connection', function(socket){
	socket.emit('rooms', ['lobby','room1','room2']);
});

app.listen(8181);
