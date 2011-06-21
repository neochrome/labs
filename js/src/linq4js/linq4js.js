(function($){
	$.linq4 = function(arr){
		arr.each = _each;
		arr.empty = _empty;
		arr.filter = _filter;
		arr.map = _map;
		arr.reduce = _reduce;
		arr.head = _head;
		arr.tail = _tail;
		arr.forAll = _all;
		arr.all = _all;
		arr.exists = _any;
		arr.any = _any;
		
		return arr;
	};
	
	var _iterate = function(items, fn, start){
		for(var i = start || 0, max = items.length; i < max; i++){
			var result = fn.call(items, items[i], i);
			if(typeof result !== 'undefined'){ return result; }
		}
		return undefined;
	};

	var _each = function(fn, start){
		if(typeof fn !== 'undefined'){
			_iterate(this, fn, start);
		}
		return this;
	};

	var _empty = function(){ return $.linq4([]); };
	
	var _filter = function(predicate){
		if(typeof predicate === 'undefined') { return this; }
		var elements = [];
		this.each(function(element, i){
			if(predicate(element, i)){ elements.push(element); }
		});
		return $.linq4(elements);
	};

	var _map = function(transform){
		if(typeof transform === 'undefined') { return this; }
		var elements = [];
		this.each(function(element, i){
			elements.push(transform(element, i));
		});
		return $.linq4(elements);
	};

	var _reduce = function(reduction){
		if(this.length < 1) { throw 'reduce requires at least one element'; }
		if(typeof reduction === 'undefined') { throw 'reduce requires a reduction function'; }
		var acc = this[0];
		this.each(function(element, i){
			acc = reduction(acc, element, i);
		}, 1);
		return acc;
	};

	var _head = function(){
		if(this.length < 1) { throw 'head requires at least one element'; }
		return this[0];
	};

	var _tail = function(){
		this.shift();
		return this;
	};

	var _all = function(predicate){
		if(typeof predicate === 'undefined') { return true; }
		if(this.length === 0) { return false; }
		var result = _iterate(this, function(element, i){
			if(!predicate(element, i)){ return false; }
		});
		return result === undefined ? true : result;
	};
	
	var _any = function(predicate){
		if(typeof predicate === 'undefined') { return true; }
		var result = _iterate(this, function(element, i){
			if(predicate(element, i)){ return true; }
		});
		return result === undefined ? false : result;
	};
	

})(this);

if(typeof module !== 'undefined'){
	module.exports = this.linq4;
}
