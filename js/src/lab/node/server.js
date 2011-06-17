var http = require('http');

http.createServer(function (req, res) {
	console.log('incoming');
	res.writeHead(200, {'Content-Type': 'text/plain'});

	setInterval(function(){
		res.write(new Date().getTime() + '\n');
	}, 1000);

}).listen(1337);

console.log('Server running at port: 1337');
