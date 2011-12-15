var sys = require('sys');
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var Twitter = require('ntwitter');



var Tweet = function(tweetData){
	this.id = tweetData.id;
	this.user = '@' + tweetData.user.screen_name;
	this.links = 
		_(tweetData.entities.urls)
		.map(function(url){ return url.expanded_url; });
	this.isStatusUpdate = 
		_(tweetData.entities.hashtags)
		.chain()
		.map(function(tag){ return tag.text; })
		.any(function(tag){ return _(['done','error']).contains(tag); })
		.value();
};
Tweet.prototype.composeReply = function(status){
	if(Array.isArray(status) === false){ status = [status]; }
	var tags = _(status).reduce(function(tags, tag){ return tags + ' #' + tag; }, '');
	return _(this.links).reduce(function(links, link){ return links + ' ' + link; },'') + ' ' + tags + ' ' + this.user;
};
Tweet.prototype.reply = function(twitter, status){
	twitter.updateStatus(this.composeReply(status), {in_reply_to_status_id:this.id}, function(err, data){
		if(err) console.log('error while replying:\n' + err.message);
	});
};



function process(tweet){
	// save last seen id
	fs.writeFileSync('state.json', JSON.stringify({lastSeenId:tweet.id}), 'utf8');
	console.log('saw tweet: ' + tweet.id + (tweet.isStatusUpdate ? ' - status update':'')); 
	
	if(tweet.isStatusUpdate || !tweet.links.length === 0)	return;

	// download the links from the message and respond when done
	_(tweet.links)
	.each(function(link){
		var options = url.parse(link);
		options.path = options.pathname;
		var filename = path.basename(options.path);
		console.log('downloading \'' + link + '\' to: ' + filename);
		http.get(options, function(res){
			switch(res.statusCode){
				case 200:
					res.on('end', function(){
						tweet.reply(twitter, 'done');
						console.log('downloading done - success');
					});
					var file = fs.createWriteStream(filename);
					file
						.once('open', function(fd){
							util.pump(res, file, function(e){
								tweet.reply(twitter, 'error');
								console.log('error saving \'' + filename + '\':\n' + e.message);
							});
						});
					break;
				default:
					tweet.respond(twitter, ['error', 'code' + res.statusCode]);
					console.log('downloading done - unexpected status: ' + res.statusCode);
			}
		}).on('error', function(e){ console.log('downloading - error:\n' + e.message); });
	});
}


var twitter = new Twitter(require('./options.js'));

var state = { lastSeenId: null };
state.lastSeenId = 146858815638339584;


console.log('catching up...');
var options = { since_id:state.lastSeenId, include_entities:true };
twitter.getUserTimeline(options, function(err, data){
	if(err) throw err;
	console.log(data.length + ' tweet(s) to process');
	_(data).each(function(item){ process(new Tweet(item)); });
});

console.log('listening...');
twitter.stream('user', function(stream){
	stream.on('data', function(data){
		if(typeof data.id === 'undefined'){
			console.log(sys.inspect(data));
			return;
		}
		process(new Tweet(data));
	});
	stream.on('end', function(res){	console.log('listening ends'); });
	stream.on('destroy', function(res){ console.log('listening stream destroyed'); });
});

