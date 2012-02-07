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
  @private
  @static
  @type String
  @constant

  A private property of this module
*/
privateVar = "Hello World";

/**
  @private

  Example of a private method.

  @param {Object} obj
  Some random parameter.

  @returns {String} some message
*/
function privateMethod(obj) {
	// Do something.
	console.log("privateMethod() called.")
	return "hello";
}
	
/**
  @private
  @static
  @type Number
  @constant

  A private property of this module
*/
AlfJS.moduleProperty = 12345;

/**
  @function
  
  Returns true.

  @param {Object} obj A parameter
  @returns {Boolean}
*/	
AlfJS.callPrivateMethod = function(obj) {
	// Do something.
	console.log("callPrivateMethod() called.");
	return privateMethod(obj);
};


/**
  @function
  
  Returns true.

  @param {Object} obj A parameter
  @returns {Boolean}
*/	
AlfJS.moduleFunction = function(obj) {
	// Do something.
	console.log("moduleFunction() called.");
	return true;
};


/**
  @function
  
  Creates a connection to a given host. Requires a configuration object to supply the necessary connection details.

  @param {Object} obj A configuration object.
  
  @returns {AlfJS} An initialized AlfJS object.
  
  @see AlfJS.setConfig()
*/	
AlfJS.createConnection = function(config) {	
	var ret = new AlfJS.Connection(config);
	
	return ret;
};

