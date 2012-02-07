require('alfjs-core/core');
require('alfjs-utils/http');
/**
  @function
  
  Sets the configuration data for a given Alfresco connection.

  @param {Object} config The configuration data for a given Alfresco connection.
  This is an object of the form:
  {
  	hostname: 'localhost',
  	port: 8080,
	protocol: 'http', <== Can also be 'https'
	serviceBase: 'alfresco/service/',
	login: 'userid',
	password: 's3cr3t'
  }
*/
AlfJS.Connection = function(config) {	
	this._CONFIG = config;
	
	this._CONFIG.url = config.protocol + '://' + config.hostname + '/' + config.serviceBase;
	
	this.http = AlfJS.ajax;
};

var Connection = AlfJS.Connection.prototype;

Connection.getConfig = function() {
	return this._CONFIG;
};

Connection.login = function() {
	
};
