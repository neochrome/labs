describe('linq4js', function(){
	var linq4 = require('./linq4.js');

	describe('when wrapping an array', function(){
		it('should return an linq4js enumerable', function(){
			var wrapped = linq4([1,2,3]);
			expect(wrapped instanceof linq4.Enumerable).toBe(true);
		});

		it('should have count same as array.length', function(){
			var arr = [1,2,3];
			var wrapped = linq4(arr);
			expect(wrapped.count()).toBe(arr.length);
		});
	});

	describe('each', function(){
		it('should execute callback for each element', function(){
			var callback = jasmine.createSpy();
			var items = linq4([1,2,3]);
			items.each(callback);
			expect(callback.callCount).toBe(items.count());
		});

		it('should execute callback with element and element index as arguments', function(){
			var callback = jasmine.createSpy();
			var items = linq4(['a', 'b']);
			items.each(callback);
			expect(callback).toHaveBeenCalledWith('a', 0);
			expect(callback).toHaveBeenCalledWith('b', 1);
		});

		it('should bind this to the enumeration in the callback', function(){
			var items = linq4([42]);
			items.each(function(){ expect(this).toBe(items); });
		});

		it('should not execute callback for empty an array', function(){
			var callback = jasmine.createSpy();
			var items = linq4([]);
			items.each(callback);
			expect(callback).not.toHaveBeenCalled();
		});

		it('should chain', function(){
			var first = jasmine.createSpy();
			var second = jasmine.createSpy();
			linq4([42]).each(first).each(second);
			expect(first).toHaveBeenCalled();
			expect(second).toHaveBeenCalled();
		});
	});

});
