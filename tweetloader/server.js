var sys = require('sys');
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var Twitter = require('ntwitter');
var options = require('./options.js');

var twitter = new Twitter(options);


var state = { lastSeenId: null };
twitter.getUserTimeline({max_id:state.lastSeenId}, function(err, data){
});

twitter.stream('user', function(stream){
	stream.on('data', function(data){
		if(typeof data.id_str === 'undefined'){
			console.log(sys.inspect(data));
			return;
		}

		// save last seen id
		state.lastSeenId = data.id_str;
		fs.writeFileSync('state.json', JSON.stringify(state), 'utf8');
		console.log('state was saved:\n' + sys.inspect(state)); 

		// do nothing if a reply or has no link
		var tweet = new Tweet(data);
		if(tweet.isResponse || !tweet.hasLink){
			return;
		}

		// download the links from the message and respond when done
		var dlOptions = url.parse(tweet.url);
		dlOptions.path = dlOptions.pathname;
		var filename = path.basename(dlOptions.path);
		console.log('downloading \'' + tweet.url + '\' to: ' + filename);
		http.get(dlOptions, function(res){
			switch(res.statusCode){
				case 200:
					res.on('end', function(){
						tweet.respond(twitter, 'done');
						console.log('done downloading \'' + tweet.url + '\'');
					});
					var file = fs.createWriteStream(filename);
					file
						.once('open', function(fd){
							util.pump(res, file, function(e){
								tweet.respond(twitter, 'error');
								console.log('error downloading \'' + tweet.url + '\'\n' + e.message);
							});
						});
					break;
				default:
					tweet.respond(twitter, ['error', 'code' + res.statusCode]);
					console.log('done downloading \'' + tweet.url + '\'');
			}
		}).on('error', function(e){
			console.log('error downloading \'' + tweet.url + '\'\n' + e.message);
		});

	});
	stream.on('end', function(res){
		console.log('end: ');
	});
	stream.on('destroy', function(res){
		console.log('destroy: ');
	});
});


var Tweet = function(tweetData){
	this.user = '@' + tweetData.user.screen_name;
	this.id = tweetData.id_str;
	this.hasLink = tweetData.entities.urls.length > 0;
	if(this.hasLink){
		this.url = tweetData.entities.urls[0].expanded_url;
	}
	this.isResponse = 
		_(tweetData.entities.hashtags)
		.chain()
		.map(function(tag){ return tag.text; })
		.any(function(tag){ return _(['done','error']).contains(tag); })
		.value();
};
Tweet.prototype.composeResponse = function(status){
	if(Array.isArray(status) === false){ status = [status]; }
	var tags = _.reduce(status, function(tags, tag) { return tags + ' #' + tag; }, '');
	return this.url + ' ' + tags + ' ' + this.user;
};
Tweet.prototype.respond = function(twitter, status){
	twitter.updateStatus(this.composeResponse(status), {in_reply_to_status_id:this.id}, function(err, data){
		if(err !== null){ throw err; }
	});
};

