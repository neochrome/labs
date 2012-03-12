var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var _ = require('underscore');

app.use('/', express.static(__dirname + '/public'));


var clients = [];

io.sockets.on('connection', function(client){
	client.room = null;
	client.name = 'anonymous';
	clients.push(client);

	publishRoomsList(client);

	client.on('disconnect', function(){
		clients.splice(clients.indexOf(client), 1);
		publishRoomsList();
	});

	client.on('join', function(room){
		client.room = room;
		client.emit('room', client.room);
		publishRoomsList();
	});

	client.on('message', function(text){
		io.sockets.emit('message', { room: client.room, name: client.name, text: text });
	});

});

var clientJoined = function(socket){
};

var publishRoomsList = function(socket){
	var rooms = 
		_.chain(clients)
		.map(function(client){ return client.room; })
		.reject(function(room){ return room === null; })
		.uniq()
		.value();
	
	socket = socket || io.sockets;
	socket.emit('rooms', rooms);
};


app.listen(8181);
