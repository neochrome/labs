(function($){
	$.fsm = function(states){
		var machine = {
			_states: states,
			toString: function(){ return this._state ? this._state.name : ''; }
		};

		if(!states){ return machine; }

		for(var s in states){
			machine[s] = select.call(machine, s);
			machine._states[s].name = s;
			for(var e in states[s]){
				if(!machine[e]){
					machine[e] = invoke.call(machine, e);
				}
			}
		}
		return machine;
	};

	function select(state){
		return function(){
			this._state = this._states[state];
			return this;
		};
	}

	function invoke(event){
		return function(){
			this._state = this._state[event].call(this._states);
			if(!this._state){ throw 'Transition to unknown state'; }
			return this;
		};
	}
})(this);

var exports;
if(exports){
	exports.fsm = this.fsm;
}

