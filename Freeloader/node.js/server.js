var http = require('http');
var fs = require('fs');


var watch = function(file, callback){
	console.log('watching: ' + file);
	fs.watchFile(file, function(curr, prev){
		console.log('"' + file + '" was changed');
		callback(file);
	});
};

var watchIn = function(folder, pattern, callback){
	fs.readdir('.', function(err, files){
		for(var i = 0; i < files.length; i++){
			watch(files[i], callback);
		}
	});
}

var connections = [];

http.createServer(function (req, res) {
	console.log('incoming');
	res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin':'*'});
	connections.push(res);
	setTimeout(function(){
		res.end('');
		var i = connections.indexOf(res);
		connections.splice(i, 1);
	}, 50000);

}).listen(1337);

watchIn('.', '*.*', function(file){
	for(var res = connections.shift(); res !== undefined; res = connections.shift()){
		res.end(file);
	}
});


console.log('Server running at port: 1337');
