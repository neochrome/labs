var exports;
if(!exports){
	this.fsm = {};
	exports = this.fsm;
}

(function($){
	$.create = function(states){
		var machine = {
			_currentState: { name: ''},
			toString: function(){ return this._currentState ? this._currentState.name : ''; }
		};

		if(!states){ return machine; }

		for(var stateName in states){
			machine[stateName] = (function(stateName){
				return function(){
					this._currentState = states[stateName];
					this._currentState.name = stateName;
					return this;
				};
			})(stateName);

			for(var eventName in states[stateName]){
				if(!machine[eventName]){
					machine[eventName] = (function(eventName){
						return function(){
							this._currentState[eventName].apply(this, arguments);
							return this;
						};
					})(eventName);
				}
			}
		}
		return machine;
	};
})(exports);
