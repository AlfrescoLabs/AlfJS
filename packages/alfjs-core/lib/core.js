if ('undefined' === typeof AlfJS) {
	AlfJS = { toString: function(){return "AlfJS";}};
	
	// aliases needed to keep minifiers from removing the global context
	if ('undefined' !== typeof window) {
	  window.AlfJS = AlfJS;
	}
	
	if ('undefined' !== typeof exports) {
	  exports.AlfJS = AlfJS;
	}
}

/**
  @function
  
  Creates a connection to a given host. Requires a configuration object to supply the necessary connection details.

  @param {Object} obj A configuration object.
  
  @returns {AlfJS} An initialized AlfJS object.
  
  @see AlfJS.setConfig()
*/	
AlfJS.createConnection = function(config) {
	return new AlfJS.Connection(config);
};

