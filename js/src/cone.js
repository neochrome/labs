(function(){
	window.Verify = {That:function(expression){
		switch(typeof expression){
		case 'function':
			if(!expression())
				throw "expectation failed: " + expression;
			default:
				if(!expression)
					throw "expectation failed: " + expression;
				}
	}};
})();

//Verify.That(function(){ return 1 == 1 });
//Verify.That(false);


(function(){
	function join(arr, glue){
		var result = arr[0] || '';
		for(var i = 1; i < arr.length; i++)
			result += glue + arr[i];
		return result;
	}

	window.Mock = function(what){
		var mock = {};
		for(var prop in what){
			if(typeof what[prop] == 'function')
			mock[prop] = function(){
				var signature = prop + '(' + join(arguments || [], ', ') + ')';
				throw 'unexpected call: ' + signature;
			};
		}
		return mock;
	};
})();


function Dep(){ 
	Dep.prototype.something = function(){alert('something');
	};}

	function doit(mock){
		mock.something();
	}
	var mock = Mock(new Dep());
	mock.something = function(){ alert('expected');};
	doit(mock);

