(function(){
	Array.prototype.each = function(fn){
		for(var i = 0, max = this.length; i < max; i++){
			fn.call(this, this[i]);
		}
	};
})();


describe('linq4js', function(){

	describe('each', function(){
		it('should execute callback for each element in array', function(){
			var callback = jasmine.createSpy();
			var arr = [1,2,3];
			arr.each(callback);
			expect(callback.callCount).toBe(arr.length);
		});

		it('should execute callback with element as argument', function(){
			var callback = jasmine.createSpy();
			var arr = ['element value'];
			arr.each(callback);
			expect(callback).toHaveBeenCalledWith('element value');
		});

		it('should bind this to the array in the callback', function(){
			var arr = [42];
			arr.each(function(){ expect(this).toBe(arr); });
		});

		it('should not execute callback for empty an array', function(){
			var callback = jasmine.createSpy();
			var arr = [];
			arr.each(callback);
			expect(callback).not.toHaveBeenCalled();
		});
	});

});
