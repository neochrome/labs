chrome.browserAction.onClicked.addListener(function(tab){
	alert('hello');
});

var comet = function(){
	$.get('http://localhost:1337/')
		.success(function(data, status, xhr){
			alert(data);
			comet();
		})
	.error(function(){
		alert('epic fail!');
	});
};

comet();
