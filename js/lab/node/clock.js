var http = require("http");

var requests = [];

http.createServer(function(req, res) {
	requests.push({
		response: res,
		timestamp: new Date().getTime()
	}); 
}).listen(1337);


function process() {
	requests.forEach(function(req) {
		req.response.writeHeader(200, {'Content-type':'text/plain'});
		var now = new Date().getTime();
		console.log('pushing: ' + now);
		req.response.end('' + now);
	});
	setTimeout(process, 1000);
}
setTimeout(process, 1000);


