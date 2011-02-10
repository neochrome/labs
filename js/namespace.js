(function () {
	window.namespace = function (namespace, declaration) {
		var parts = namespace.split('.');
		var context = window;
		while (parts.length > 0) {
			var part = parts.shift();
			if (!context[part])
				context[part] = {};
			context = context[part];
		}
		declaration(context);
	};
})();