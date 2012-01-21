if ('undefined' === typeof AlfJS) {
	AlfJS = { toString: function(){return "AlfJS";}};
	// aliases needed to keep minifiers from removing the global context
	if ('undefined' !== typeof window) {
	  window.AlfJS = AlfJS;
	}
}
var my = this;	
var _private = my._private = my._private || {},
		_seal = my._seal = my._seal || function () {
			delete my._private;
			delete my._seal;
			delete my._unseal;
		},
		_unseal = my._unseal = my._unseal || function () {
			my._private = _private;
			my._seal = _seal;
			my._unseal = _unseal;
		};
	
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
};
	
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
AlfJS.moduleFunction = function(obj) {
	// Do something.
	console.log("moduleFunction() called.");
	return true;
};
	
