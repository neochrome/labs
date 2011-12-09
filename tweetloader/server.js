var sys = require('sys');
var Twitter = require('ntwitter');
var options = require('./options.js');

var twit = new Twitter(options);

twit.stream('user', function(stream){
	stream.on('data', function(data){
		if(typeof data.id_str === 'undefined'){
			console.log(sys.inspect(data));
			return;
		}
		console.log('text: ' + data.text);
		console.log('#  s: ' + sys.inspect(data.entities.hashtags));
		console.log('urls: ' + sys.inspect(data.entities.urls));
		//console.log(sys.inspect(data));
		
		if(data.text === 'echo'){
			twit.updateStatus('re: echo', {in_reply_to_status_id:data.id_str}, function(err, data){
				console.log(sys.inspect(err));
			});
		}

	});
	stream.on('end', function(res){
		console.log('end: ');// + sys.inspect(res));
	});
	stream.on('destroy', function(res){
		console.log('destroy: ');// + sys.inspect(res));
	});
	//setTimeout(stream.destroy, 5000);
});
