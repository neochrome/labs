var stopped = true;
var running = false;

chrome.browserAction.onClicked.addListener(function(tab){
	running = !running;
	if(stopped){
		comet();
	}
	if(running){
		icon.enabled();
	} else {
		icon.disabled();
	}
});

var comet = function(){
	$.get('http://localhost:1337/')
		.success(function(data, status, xhr){
			if(data !== ''){
				chrome.windows.getCurrent(function(window){
					chrome.tabs.getSelected(window.id, function(tab){
						chrome.tabs.update(tab.id, {url:tab.url});
					});
				});
			}
		})
		.error(function(){
			icon.error();
		})
		.complete(function(){
			if(running){
				comet();
			} else {
				stopped = true;
			}
		});
};

var icon = {
	enabled:function(){
		this._set('icon.png');
	},
	disabled:function(){
		this._set('icon-disabled.png');
	},
	error:function(){
		this._set('icon-error.png');
	},
	_set:function(filename){
		chrome.browserAction.setIcon({path:filename});
	}
};

