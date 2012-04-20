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
			//comet.launch();
			this.SYNCING();
		},
		success:function(){
			//comet.stop();
			this.DISABLED();
		},
		fail:function(){
			//comet.stop();
			this.DISABLED();
		}
	},
	SYNCING:{
		toggle:function(){
			icon.disabled();
			//comet.stop();
			this.DISABLED();
		},
		success:function(data){
			console.log('synced: ' + lastChange + ' => ' + data.lastChange);
			lastChange = data.lastChange;
			this.ENABLED();
		},
		fail:function(){
			icon.error();
			this.FAILED();
		}
	},
	ENABLED:{
		toggle:function(){
			icon.disabled();
			//comet.stop();
			this.DISABLED();
		},
		success:function(data){
			if(lastChange < data.lastChange){
				console.log('reload: ' + lastChange + ' => ' + data.lastChange);
				lastChange = data.lastChange;
				refresh();
			}
			this.ENABLED();
		},
		fail:function(){
			icon.error();
			this.FAILED();
		}
	},
	FAILED:{
		toggle:function(){
			icon.disabled();
			//comet.stop();
			this.DISABLED();
		},
		success:function(){
			icon.enabled();
			refresh();
			this.ENABLED();
		},
		fail:function(){
			timesFailed++;
			if(timesFailed >= 5){
				timesFailed = 0;
				icon.disabled();
				//comet.stop();
				this.DISABLED();
			} else {
				this.FAILED();
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
/*
var comet = new Comet('http://localhost:1337/')
	.launchParams(function(){ return {lastChange:lastChange}; })
	.data(function(data){ states.success(data); })
	.error(function(){ states.fail(); });
*/
