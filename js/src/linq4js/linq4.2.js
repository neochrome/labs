(function($){
	$.linq4 = function(arr){
		arr.each = function(fn, start){
			if(typeof fn !== 'undefined'){
				for(var i = start || 0, max = this.length; i < max; i++){
					fn.call(this, this[i], i);
				}
			}
			return this;
		};

		arr.empty = function(){ return $.linq4([]); };

		arr.filter = function(predicate){
			if(typeof predicate === 'undefined') { return this; }
			var elements = [];
			this.each(function(element, i){
				if(predicate(element, i)){ elements.push(element); }
			});
			return $.linq4(elements);
		};

		arr.map = function(transform){
			if(typeof transform === 'undefined') { return this; }
			var elements = [];
			this.each(function(element, i){
				elements.push(transform(element, i));
			});
			return $.linq4(elements);
		};

		arr.reduce = function(reduction){
			if(this.length < 1) { throw 'reduce requires at least one element'; }
			if(typeof reduction === 'undefined') { throw 'reduce requires a reduction function'; }
			var acc = this[0];
			this.each(function(element, i){
				acc = reduction(acc, element, i);
			}, 1);
			return acc;
		};

		arr.head = function(){
			if(this.length < 1) { throw 'head requires at least one element'; }
			return this[0];
		};

		arr.tail = function(){
			this.shift();
			return this;
		};

		arr.forAll = function(predicate){
			if(typeof predicate === 'undefined') { return true; }
			if(this.length === 0) { return false; }
			for(var i = 0, max = this.length; i < max; i++){
				if(!predicate(this[i], i)){ return false; }
			}
			return true;
		};
		arr.all = arr.forAll;
		
		arr.exists = function(predicate){
			if(typeof predicate === 'undefined') { return true; }
			for(var i = 0, max = this.length; i < max; i++){
				if(predicate(this[i], i)){ return true; }
			}
			return false;
		};
		arr.any = arr.exists;
		
		return arr;
	};

})(this);

if(typeof module !== 'undefined'){
	module.exports = this.linq4;
}
