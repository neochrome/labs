var Comet = function(url){
	this.url = url;
	this.inTheAir = false;
	this.dataCallback = function(){};
	this.errorCallback = function(){};
};
Comet.poll = function(url){
	return new Comet(url());
};
Comet.prototype.data = function(callback){
	this.dataCallback = callback;
	return this;
};
Comet.prototype.error = function(callback){
	this.errorCallback = callback;
	return this;
};
Comet.prototype.launch = function(){
	this.inTheAir = true;
	var self = this;
	$.get(this.url)
		.success(function(data, status, xhr){
			if(data !== ''){
				self.dataCallback(data);
			}
		})
		.error(function(){
			self.errorCallback();
		})
		.complete(function(){
			if(self.inTheAir){
				self.launch();
			}
		});
	return this;
};
Comet.prototype.stop = function(){
	this.inTheAir = false;
};

var icon = {
	enabled:function(){
		this._set('../images/icon.png');
	},
	disabled:function(){
		this._set('../images/icon-disabled.png');
	},
	error:function(){
		this._set('../images/icon-error.png');
	},
	_set:function(filename){
		chrome.browserAction.setIcon({path:filename});
	}
};


var states = fsm({
	DISABLED:{
		toggle: function(){
			icon.enabled();
			comet.launch();
			return this.ENABLED;
		},
		success:function(){
			comet.stop();
			return this.DISABLED;
		},
		fail:function(){
			comet.stop();
			return this.DISABLED;
		}
	},
	ENABLED:{
		toggle:function(){
			icon.disabled();
			comet.stop();
			return this.DISABLED;
		},
		success:function(data){
			var lastUpdate = int.parse(data, 10);
			if(lastSeen < lastUpdate){
				lastSeen = lastUpdate;
				refresh();
			}
			return this.ENABLED;
		},
		fail:function(){
			icon.error();
			return this.FAILED;
		}
	},
	FAILED:{
		toggle:function(){
			icon.disabled();
			comet.stop();
			return this.DISABLED;
		},
		success:function(){
			icon.enabled();
			refresh();
			return this.ENABLED;
		},
		fail:function(){
			return this.FAILED;
		}
	}
}).DISABLED();

var refresh = function(){
	chrome.windows.getCurrent(function(window){
		chrome.tabs.getSelected(window.id, function(tab){
			chrome.tabs.update(tab.id, {url:tab.url});
		});
	});
};

chrome.browserAction.onClicked.addListener(function(tab){
	states.toggle();
});

var lastSeen = 0;
var comet = Comet.poll(function(){ return 'http://localhost:1337/?' + lastSeen; })
	.data(function(data){ states.success(data); })
	.error(function(){ states.fail(); });

