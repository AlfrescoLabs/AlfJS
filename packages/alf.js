var AlfJS = (function (alf) {
	// add capabilities...
	alf.toString = function(){return "AlfJS";};
	

	/**
	  @function
  
	  Creates a connection to a given host. Requires a configuration object to supply the necessary connection details.

	  @param {Object} obj A configuration object.
  
	  @returns {AlfJS} An initialized AlfJS object.
  
	  @see AlfJS.setConfig()
	*/	
	alf.createConnection = function(config) {
		return new alf.Connection(config);
	};	

	// aliases needed to keep minifiers from removing the global context
	if ('undefined' !== typeof window) {
	  window.AlfJS = alf;
	}
	
	if ('undefined' !== typeof exports) {
	  exports.AlfJS = alf;
	}
	
	return alf;
}(AlfJS || {}));



