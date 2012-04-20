var fsm = require('../lib/simple-fsm.js');

describe('a fsm', function(){
	var machine;
	
	describe('when created', function(){
		beforeEach(function(){
			machine = fsm.create();
		});

		it('should not have any initial state set', function(){
			expect(machine.toString()).toBe('');
		});
	});

	describe('with some states', function(){
		beforeEach(function(){
			machine = fsm.create({
				STARTED:{ stop: function(){ this.STOPPED(); } },
				STOPPED:{ idle: function(){ this.IDLING(); } }
			});
		});

		it('should support setting initial state', function(){
			machine.STARTED();
			expect(machine.toString()).toBe('STARTED');
		});

		it('should fail when setting unknown state', function(){
			expect(function(){ machine.UNKNOWN(); }).toThrow();
		});

		it('should transition to next state', function(){
			machine.STARTED();
			machine.stop();
			expect(machine.toString()).toBe('STOPPED');
		});

		it('should fail for unknown transition event', function(){
			machine.STARTED();
			expect(function(){ machine.idle(); }).toThrow();
		});

		it('should fail when transitioning to for unknown state', function(){
			machine.STOPPED();
			expect(function(){ machine.idle(); }).toThrow();
		});
	});

	describe('when acting as an on/off switch', function(){
		beforeEach(function(){
			machine = fsm.create({
				OFF:{ toggle:function(){ this.ON(); } },
				ON:{ toggle:function(){ this.OFF(); } }
			}).OFF();
		});

		it('should toggle', function(){
			machine.toggle();
			expect(machine.toString()).toBe('ON');
			machine.toggle();
			expect(machine.toString()).toBe('OFF');
		});
	});

	describe('when set up to receive args to transition event', function(){
		beforeEach(function(){
			machine = fsm.create({
				INIT:{ next:function(arg){ this.argPassed = arg; this.NEXT(); } },
				NEXT:{ }
			}).INIT();
			machine.argPassed = undefined;
		});

		it('should receive args passed to transition event', function(){
			machine.next(42);
			expect(machine.argPassed).toBe(42);
		});
	});

});

