var Comet = function(url){
	this._url = url;
	this._inTheAir = false;
	this._dataCallback = function(){};
	this._errorCallback = function(){};
	this._launchParamsCallback = function(){ return {}; };
};
Comet.prototype.data = function(callback){
	this._dataCallback = callback;
	return this;
};
Comet.prototype.error = function(callback){
	this._errorCallback = callback;
	return this;
};
Comet.prototype.launchParams = function(callback){
	this._launchParamsCallback = callback;
	return this;
};
Comet.prototype.launch = function(){
	this._inTheAir = true;
	var self = this;
	$.getJSON(self._url, self._launchParamsCallback())
		.success(function(data, status, xhr){
			if(data){
				self._dataCallback(data);
			}
			if(!self._inTheAir){ return ; }
			self.launch();
		})
		.error(function(){
			self._errorCallback();
			if(!self._inTheAir){ return ; }
			setTimeout(function(){ self.launch(); }, 1000);
		});
	return this;
};
Comet.prototype.stop = function(){
	this._inTheAir = false;
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
			return this.SYNCING;
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
	SYNCING:{
		toggle:function(){
			icon.disabled();
			comet.stop();
			return this.DISABLED;
		},
		success:function(data){
			console.log('synced: ' + lastChange + ' => ' + data.lastChange);
			lastChange = data.lastChange;
			return this.ENABLED;
		},
		fail:function(){
			icon.error();
			return this.FAILED;
		}
	},
	ENABLED:{
		toggle:function(){
			icon.disabled();
			comet.stop();
			return this.DISABLED;
		},
		success:function(data){
			if(lastChange < data.lastChange){
				console.log('reload: ' + lastChange + ' => ' + data.lastChange);
				lastChange = data.lastChange;
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
			timesFailed++;
			if(timesFailed >= 5){
				timesFailed = 0;
				icon.disabled();
				comet.stop();
				return this.DISABLED;
			} else {
				return this.FAILED;
			}
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

var lastChange = 0;
var timesFailed = 0;
var comet = new Comet('http://localhost:1337/')
	.launchParams(function(){ return {lastChange:lastChange}; })
	.data(function(data){ states.success(data); })
	.error(function(){ states.fail(); });

