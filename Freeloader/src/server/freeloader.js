var fs = require('fs');
var watch = function(file, callback){
	console.log('watching: ' + file);
	fs.watchFile(file, {persistent:true, interval:100}, function(curr, prev){
		callback(file);
	});
};

var watchIn = function(folder, pattern, callback){
	fs.readdir('.', function(err, files){
		for(var i = 0; i < files.length; i++){
			watch(files[i], callback);
		}
	});
};

var connections = [];
var lastChange = 0;

var http = require('http');
var url = require('url');
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin':'*'});
	
	if(req.url === '/sync'){
		sendReloadNotificationTo(res);
		return;
	}
	
	query = url.parse(req.url, true).query;
	var connection = {
		lastChange: parseInt(query.lastChange || '0'),
		response: res
	};
	connections.unshift(connection);

	setTimeout(function(){
		connection.response.end('');
		var i = connections.indexOf(connection);
		connections.splice(i, 1);
	}, 10000);

}).listen(1337);

watchIn('.', '*', function(file){
	lastChange = new Date().getTime();
	console.log('"' + file + '" was changed at ' + lastChange);
});

var sendReloadNotificationTo = function(response){
	response.end(JSON.stringify({lastChange:lastChange}));
};

var processConnections = function(){
	connections = connections.filter(function(connection){
		if(connection.lastChange < lastChange){
			sendReloadNotificationTo(connection.response);
			return false;
		}
	 	return true;
	});
	setTimeout(processConnections, 500);
};
processConnections();

console.log('Server running at port: 1337');
console.log('Press ctrl+c to exit');
