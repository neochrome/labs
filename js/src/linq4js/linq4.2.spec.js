describe('linq4js', function(){
	var linq4 = require('./linq4.2.js');

	beforeEach(function(){
		this.addMatchers({
			toEqualSequence: function(expected){
				if(this.actual.length !== expected.length) { return false; }
				for(var i = 0, max = expected.length; i < max; i++){
					if(this.actual[i] !== expected[i]) { return false; }
				}
				return true;
			}
		});
	});

	describe('when wrapping an array', function(){
		it('should keep structure', function(){
			var arr = [1,2,3];
			var wrapped = linq4(arr);
			expect(wrapped).toEqualSequence(arr);
		});
	});

	describe('each', function(){
		it('should execute callback for each element', function(){
			var callback = jasmine.createSpy();
			var items = linq4([1,2,3]);
			items.each(callback);
			expect(callback.callCount).toBe(items.length);
		});

		it('should execute callback with element and element index as arguments', function(){
			var callback = jasmine.createSpy();
			var items = linq4(['a', 'b']);
			items.each(callback);
			expect(callback).toHaveBeenCalledWith('a', 0);
			expect(callback).toHaveBeenCalledWith('b', 1);
		});

		it('should bind this in the callback', function(){
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

	describe('filter', function(){
		it('should not test predicate when no elements', function(){
			var predicate = jasmine.createSpy();
			linq4([]).filter(predicate);
			expect(predicate).not.toHaveBeenCalled();
		});

		it('should execute predicate with element and index', function(){
			var predicate = jasmine.createSpy();
			linq4([1,2]).filter(predicate);
			expect(predicate).toHaveBeenCalledWith(1, 0);
			expect(predicate).toHaveBeenCalledWith(2, 1);
		});
		
		it('should keep all elements when no predicate supplied', function(){
			var items = linq4([1,2,3]);
			var after = items.filter();
			expect(after).toEqualSequence(items);
		});

		it('should keep elements for which predicate is true', function(){
			var items = linq4([1,2,3]);
			var after = items.filter(function(element){ return element === 2; });
			expect(after).toEqualSequence([2]);
		});

		it('should be empty when no elements matches predicate', function(){
			var items = linq4([1,2,3]);
			var after = items.filter(function(i){ return false; });
			expect(after).toEqualSequence([]);
		});
	});

	describe('map', function(){
		it('should not map when no transform supplied', function(){
			var items = linq4([1,2,3]);
			var after = items.map();
			expect(after).toEqualSequence(items);
		});

		it('should transform each element', function(){
			var items = linq4([1,2,3]);
			var after = items.map(function(element){ return element * 2; });
			expect(after).toEqualSequence([2,4,6]);
		});
		
		it('should execute transform with element and index', function(){
			var transform = jasmine.createSpy();
			linq4([1,2]).map(transform);
			expect(transform).toHaveBeenCalledWith(1, 0);
			expect(transform).toHaveBeenCalledWith(2, 1);
		});
	});

	describe('reduce', function(){
		var add = function(acc, element, i) { return acc + element; };
		it('should require at least one element', function(){
			expect(function(){ linq4([]).reduce(); }).toThrow();
		});

		it('should return only element', function(){
			expect(linq4([42]).reduce(add)).toBe(42);
		});

		it('should execute reduction with accumulator, element and index', function(){
			var reduction = jasmine.createSpy();
			linq4([1,2]).reduce(reduction);
			expect(reduction).toHaveBeenCalledWith(1, 2, 1);
		});
		
		it('should produce sum for entire array', function(){
			expect(linq4([1,2,3]).reduce(add)).toBe(1 + 2 + 3);
		});
	});
	
	describe('head', function(){
		it('should require at least one element', function(){
			expect(function(){ linq4([]).head(); }).toThrow();
		});

		it('should return first element', function(){
			expect(linq4([1,2,3]).head()).toBe(1);
		});
	});
	
	describe('tail', function(){
		it('should be empty when no elements', function(){
			expect(linq4([]).tail()).toEqualSequence([]);
		});

		it('should return all elements except the first', function(){
			expect(linq4([1,2,3]).tail()).toEqualSequence([2,3]);
		});
	});
	
	describe('forAll & all', function(){
		it('should be false when empty', function(){
			expect(linq4([]).forAll(function(){ return true; })).toBe(false);
			expect(linq4([]).all(function(){ return true; })).toBe(false);
		});
		
		it('should be true when no predicate supplied', function(){
			expect(linq4([1,2,3]).forAll()).toBe(true);
			expect(linq4([1,2,3]).all()).toBe(true);
		});

		it('should be true when predicate holds for all elements', function(){
			expect(linq4([1]).forAll(function(){ return true; })).toBe(true);
			expect(linq4([1]).all(function(){ return true; })).toBe(true);
		});

		it('should be false when predicate fails for at least one element', function(){
			expect(linq4([1,2,3]).forAll(function(element){ return element === 1; })).toBe(false);
			expect(linq4([1,2,3]).all(function(element){ return element === 1; })).toBe(false);
		});
	});
	
	describe('exists & any', function(){
		it('should be false when empty', function(){
			expect(linq4([]).exists(function(){ return true; })).toBe(false);
			expect(linq4([]).any(function(){ return true; })).toBe(false);
		});
		
		it('should be true when no predicate supplied', function(){
			expect(linq4([1,2,3]).exists()).toBe(true);
			expect(linq4([1,2,3]).any()).toBe(true);
		});

		it('should be false when predicate fails for all elements', function(){
			expect(linq4([1]).exists(function(){ return false; })).toBe(false);
			expect(linq4([1]).any(function(){ return false; })).toBe(false);
		});

		it('should be true when predicate holds for at least one element', function(){
			expect(linq4([1,2,3]).exists(function(element){ return element === 1; })).toBe(true);
			expect(linq4([1,2,3]).any(function(element){ return element === 1; })).toBe(true);
		});
	});
	
	describe('min', function(){
	});
	
	describe('minBy', function(){
	});
	
	describe('max', function(){
	});
	
	describe('maxBy', function(){
	});

});
