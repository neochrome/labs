var Comet = function(url){
	this.url = url;
	this.inTheAir = false;
	this.dataCallback = function(){};
	this.errorCallback = function(){};
};
Comet.poll = function(url){
	return new Comet(url);
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


var states = Stately.machine({
	NEW:{
		start:function(){
			return this.DISABLED;
		}
	},
	DISABLED:{
		toggle: function(){
			icon.enabled();
			comet.launch();
			return this.ENABLED;
		}
	},
	ENABLED:{
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
			icon.error();
			return this.FAILED;
		}
	},
	FAILED:{
		fail:function(){
			return this.FAILED;
		},
		success:function(){
			icon.enabled();
			refresh();
			return this.ENABLED;
		},
		toggle:function(){
			icon.disabled();
			comet.stop();
			return this.DISABLED;
		}
	}
});

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

var comet = Comet.poll('http://localhost:1337/')
	.data(states.success)
	.error(states.fail);

states.start();
