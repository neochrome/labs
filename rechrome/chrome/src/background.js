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

var states = fsm.create({
	DISABLED:{
		toggle: function(){
			icon.enabled();
			this.ENABLED();
		},
		change:function(){},
		fail:function(){}
	},
	ENABLED:{
		toggle:function(){
			icon.disabled();
			this.DISABLED();
		},
		change:function(data){
			console.log('refresh:', lastChange, '<', data.lastChange);
			if(lastChange < data.lastChange){
				console.log('reload: ' + lastChange + ' => ' + data.lastChange);
				lastChange = data.lastChange;
				refreshCurrentTab();
			}
		},
		fail:function(error){
			console.error(error);
			icon.error();
			this.FAILED();
		}
	},
	FAILED:{
		toggle:function(){
			icon.disabled();
			this.DISABLED();
		},
		change:function(data){
			icon.enabled();
			this.ENABLED().change(data);
		},
		fail:function(error){
			console.error(error);
			timesFailed++;
			if(timesFailed >= 5){
				timesFailed = 0;
				icon.disabled();
				this.DISABLED();
			}
		}
	}
}).DISABLED();

var refreshCurrentTab = function(){
	console.log('refreshing current tab');
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

var socket = io.connect('http://localhost:1337');
socket.on('change', function(data){states.change(data);});
socket.on('error', function(){states.fail();});
socket.on('disconnected', function(){icon.disabled();states.DISABLED();});
