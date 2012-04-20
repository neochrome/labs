var FS = require('fs');
var Path = require('path');

var server = require('http').createServer();
var io = require('socket.io').listen(server);
var _ = require('underscore');

io.sockets.on('connection', function(client){
	console.log('client connected');
});

server.listen(1337);
console.log('Server running at port: 1337');
console.log('Press ctrl+c to exit');


console.log('detecting directories...');
var findDirs = function(path, emit, options){
	options = options || { recurse: false, exclude:[]};
	FS.readdir(path, function(err, files){
		if(err) { console.error(err); return; }
		_.chain(files).reject(function(file){ return _(options.exclude).include(file); }).each(function(file){
			var fullPath = Path.join(path, file);
			FS.stat(fullPath, function(err, stat){
				if(err) { console.error(err); return; }
				if(stat.isDirectory()) {
					emit(fullPath);
					if(options.recurse) { findDirs(fullPath, emit, options); }
				}
			});
		});
	});
};

findDirs('.', function(directory){
	console.log(' ', directory);
	FS.watch(directory, {persistent:true}, function(event, filename){
		console.log(event, filename);
		io.sockets.emit('change', {lastChange: new Date().getTime()});
	});
}, {recurse:false, exclude:['.git','node_modules']});

