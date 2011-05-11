var icon = {
	enabled: function(){
		this._set('icon32.png');
	},
	disabled: function(){
		this._set('disabled32.png');
	},
	_set : function(image){
		chrome.browserAction.setIcon({path:'../images/' + image});
	}
};

var badge = {
	unknown: function(){
		this._text('?');
		this._color([190,190,190,230]);
	},
	success: function(){
		this._text('ok');
		this._color([0,255,0,230]);
	},
	failed: function(count){
		this._text(count.toString());
		this._color([255,0,0,230]);
	},
	clear: function(){
		this._text('');
	},
	_text: function(text){
		chrome.browserAction.setBadgeText({text: text});
	},
	_color: function(color){
		chrome.browserAction.setBadgeBackgroundColor({color: color});
	}
};

var action = {
	options: function(){
		chrome.browserAction.setPopup({popup: ''});
	},
	status: function(){
		chrome.browserAction.setPopup({popup: 'views/status.html'});
	}
};
chrome.browserAction.onClicked.addListener(function(tab){
	openTab(chrome.extension.getURL('views/options.html'));
});

var openTab = function(url){
	chrome.tabs.create({url:url});
};



var builds = [];

var update = function(){
	var todo = [];
	var buildTypesUrl = localStorage.baseUrl + '/httpAuth/app/rest/buildTypes';

	$.getJSON(buildTypesUrl)
		.success(function(data){
			builds = data.buildType.slice();
			todo = data.buildType.slice();

			icon.enabled();
			badge.unknown();
			action.status();

			updateStatuses();
			setTimeout(update, localStorage.successRefreshInterval || 60000);
		})
	.error(function(){
		console.error('failed to retrieve build types from: ' + buildTypesUrl);
	
		icon.disabled();
		badge.unknown();
		action.options();

		setTimeout(update, localStorage.errorRefreshInterval || 10000);
	});

	var updateStatuses = function(){
		if(todo.length === 0) {
			updateCompleted();
			return;
		}
		var buildTypeToCheck = todo.shift();
		var buildsUrl = localStorage.baseUrl + buildTypeToCheck.href + '/builds?count=1';

		$.getJSON(buildsUrl)
			.success(function(data){
				var build = data.build[0];
				builds.forEach(function(buildType){
					if(build.buildTypeId === buildType.id){
						buildType.status = build.status === 'SUCCESS' ? 'success' : 'failure';
					}
				});
			})
		.error(function(){
			console.error('failed to retrieve build status from: ' + buildsUrl);
		})
		.complete(updateStatuses);
	};

	var updateCompleted = function(){
		var failed = 0;
		builds.forEach(function(x){
			if(x.status === 'failure'){ failed++; }
	 	});
		icon.enabled()
		failed > 0 ? badge.failed(failed) : badge.success();
	};

};

update();
