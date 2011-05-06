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
	var connection = {
		lastSeen: url.parse(req.url).query || 0,
		response: res
	};
	connections.unshift(connection);
	console.log(connection.lastSeen);

	setTimeout(function(){
		connection.response.end('');
		var i = connections.indexOf(connection);
		connections.splice(i, 1);
	}, 10000);

}).listen(1337);

watchIn('.', '*', function(file){
	console.log('"' + file + '" was changed');
	lastChange = new Date().getTime();
});

var notifyReload = function(){
	connections = connections.filter(function(connection){
		if(connection.lastSeen < lastChange){
			connection.response.end(lastChange.toString());
			return false;
		}
	 	return true;
	});
	setTimeout(notifyReload, 500);
};
notifyReload();

console.log('Server running at port: 1337');
console.log('Press ctrl+c to exit');
