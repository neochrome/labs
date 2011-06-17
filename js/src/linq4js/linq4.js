(function($){
	$.linq4 = function(arr){
		return new $.linq4.Enumerable(arr);
	};

	$.linq4.Enumerable = function(elements){
		this._elements = elements;
	};
	
	$.linq4.Enumerable.prototype.count = function(){ return this._elements.length; };

	$.linq4.Enumerable.prototype.each = function(fn){
		for(var i = 0, max = this._elements.length; i < max; i++){
			fn.call(this, this._elements[i], i);
		}
	};
})(this);

if(typeof module !== 'undefined'){
	module.exports = this.linq4;
}
