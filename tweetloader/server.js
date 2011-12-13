var sys = require('sys');
var http = require('http');
var url = require('url');
var _ = require('underscore');
var Twitter = require('ntwitter');
var options = require('./options.js');

var twitter = new Twitter(options);

twitter.stream('user', function(stream){
	stream.on('data', function(data){
		if(typeof data.id_str === 'undefined'){
			console.log(sys.inspect(data));
			return;
		}

		var tweet = new Tweet(data);
		if(tweet.isResponse || !tweet.hasLink){
			return;
		}

		console.log('downloading \'' + tweet.url + '\'');
		var dlOptions = url.parse(tweet.url);
		dlOptions.path = dlOptions.pathname;
		http.get(dlOptions, function(res){
			switch(res.statusCode){
				case 200:
					tweet.respond(twitter, 'done');
					console.log('done downloading \'' + tweet.url + '\'');
					break;
				default:
					tweet.respond(twitter, ['error', 'code' + res.statusCode]);
					console.log('done downloading \'' + tweet.url + '\'');
			}
		}).on('error', function(e){
			console.log('error when downloading \'' + tweet.url + '\'\n' + e.message);
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

