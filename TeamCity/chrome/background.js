
var composeIcon = function(badgeImageUrl, whenDone){
	var canvas = document.getElementById('icon-canvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width, canvas.height);

	var icon = new Image();
	icon.src = 'icon128.png';
	icon.onload = function(){
		ctx.drawImage(icon, 0, 0, 19, 19);
		var badge = new Image();
		badge.src = badgeImageUrl;
		badge.onload = function(){
			ctx.drawImage(badge, 5, 5, 15, 15);
			whenDone(ctx.getImageData(0, 0, 19, 19));
		};
	};
};
var failureIconData, successIconData;
composeIcon('success.gif', function(data){ successIconData = data; });
composeIcon('failure.gif', function(data){ failureIconData = data; });

var builds = [];

var update = function(){
	if(!localStorage['baseUrl']){
		alert('Set base url in options page');
		return;
	}
	var baseUrl = localStorage['baseUrl'];
	var todo = [];

	$.getJSON(baseUrl + '/httpAuth/app/rest/buildTypes')
		.success(function(data){
			builds = data.buildType.slice();
			todo = data.buildType.slice();

			updateStatuses();
			setTimeout(update, 60000);
		})
	.error(function(){
		setTimeout(update, 10000);
	});

	var updateStatuses = function(){
		if(todo.length === 0) {
			updateCompleted();
			return;
		}
		var buildTypeToCheck = todo.shift();

		$.getJSON(baseUrl + buildTypeToCheck.href + '/builds?count=1')
			.success(function(data){
				var build = data.build[0];
				builds.forEach(function(buildType){
					if(build.buildTypeId === buildType.id){
						buildType.status = build.status === 'SUCCESS' ? 'success' : 'failure';
					}
				});
			})
		.complete(updateStatuses);
	};

	var updateCompleted = function(){
		var failed = 0;
		builds.forEach(function(x){
			if(x.status === 'failure'){ failed++; }
	 	});
		var iconData, badgeText;
		iconData = failed ? failureIconData : successIconData;
		badgeText = failed > 1 ? failed.toString() : '';
		chrome.browserAction.setIcon({imageData:iconData});
		chrome.browserAction.setBadgeText({text:badgeText});
	};

};

update();



