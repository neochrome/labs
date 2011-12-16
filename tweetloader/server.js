var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var _ = require('underscore');
var Twitter = require('ntwitter');



var Tweet = function(tweetData, twitter){
	this.twitter = twitter;
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
Tweet.prototype.composeReply = function(status, message){
	if(typeof(message) === 'undefined'){
		message = _(this.links).reduce(function(links, link){ return links + ' ' + link; },'');  
	}
	if(Array.isArray(status) === false){ status = [status]; }
	var tags = _(status).reduce(function(tags, tag){ return tags + ' #' + tag; }, '');
	return message + ' ' + tags + ' ' + this.user;
};
Tweet.prototype.reply = function(status, message){
	this.twitter.updateStatus(this.composeReply(status, message), {in_reply_to_status_id:this.id}, function(err, data){
		if(err) console.log('error while replying:\n' + err.message);
	});
};



var State = function(obj){
	this.lastSeenId = null;

	if(typeof(obj) !== 'object') return;
	for(var p in obj){
		if(typeof(obj[p]) === 'function') continue;
		this[p] = obj[p];
	}
}
State.prototype.save = function(){
	fs.writeFileSync('state.json', JSON.stringify(this), 'utf8');
};
State.load = function(){
	if(!path.existsSync('state.json')) return new State();
	return new State(JSON.parse(fs.readFileSync('state.json', 'utf8')));
};



function handle(tweet){
	// save last seen id
	state.lastSeenId = tweet.id;
	state.save();
	
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
						tweet.reply('done', link);
						console.log('downloading done - success');
					});
					var file = fs.createWriteStream(filename);
					file
						.once('open', function(fd){
							util.pump(res, file, function(e){
								tweet.reply('error', link);
								console.log('error saving \'' + filename + '\':\n' + e.message);
							});
						});
					break;
				default:
					tweet.reply(['error', 'code' + res.statusCode], link);
					console.log('downloading done - unexpected status: ' + res.statusCode);
			}
		}).on('error', function(e){ console.log('downloading - error:\n' + e.message); });
	});
}



var state = State.load();

var twitter = new Twitter(require('./options.js'));

console.log('catching up...');
var options = { include_entities:true };
if(state.lastSeenId !== null){
	console.log('last seen id: ' + state.lastSeenId);
	options.since_id = state.lastSeenId;
}
twitter.getUserTimeline(options, function(err, data){
	if(err) throw err;
	console.log(data.length + ' tweet(s) to process');
	_(data).each(function(item){ handle(new Tweet(item, twitter)); });
});

console.log('listening...');
twitter.stream('user', function(stream){
	process.on('SIGINT', function(){
		console.log('got SIGINT');
		stream.destroy();
		process.exit();
	});

	stream.on('data', function(data){
		if(typeof data.id === 'undefined'){
			console.log(util.inspect(data));
			return;
		}
		handle(new Tweet(data, twitter));
	});
	stream.on('end', function(res){	console.log('listening ends'); });
	stream.on('destroy', function(res){ console.log('listening stream destroyed'); });
});

