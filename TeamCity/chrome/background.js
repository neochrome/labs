
//chrome.browserAction.onClicked.addListener(function(tab){
//	chrome.browserAction.setPopup({popup:JSON.stringify(builds)});
//chrome.browserAction.setBadgeText({text:number.toString()});
//chrome.browserAction.setBadgeBackgroundColor({color:[(number % 16) * 16,0,0,255]});
//});

//var toast = function(message){
//	var notification = webkitNotifications.createNotification('failure.gif', 'Build failed!', message);
//	notification.show();
//	setTimeout(function(){notification.cancel();}, 10000);
//};

//var failureCanvas = document.getElementById('failure');
//var ctx = failureCanvas.getContext('2d');
//var icon = new Image();
//icon.src = 'icon128.png';
//var icon = document.getElementById('icon');
//ctx.drawImage(icon, 0, 0, 19, 19);
//var badge = new Image();
//badge.src = 'failure.gif';
//ctx.drawImage(badge, 0, 0, 10, 10);
//var failureIcon = ctx.getImageData(0, 0, 19, 19);


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
		var anyFailed = builds.some(function(x){ return x.status === 'failure'; });
		if(anyFailed){
			chrome.browserAction.setIcon({path:'failure.gif'});
		} else {
			chrome.browserAction.setIcon({path:'success.gif'});
		}
	};

};

update();



