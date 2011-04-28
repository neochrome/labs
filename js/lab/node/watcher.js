var fs = require('fs');

var watch = function(file){
	console.log('watching: ' + file);
	fs.watchFile(file, function(curr, prev){
		console.log('"' + file + '" was changed');
	});
};

fs.readdir('.', function(err, files){
	for(var i = 0; i < files.length; i++){
		watch(files[i]);
	}
});



