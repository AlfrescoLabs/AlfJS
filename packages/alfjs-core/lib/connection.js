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
    this._LOGIN_TICKET = undefined;

	this._CONFIG = config;
	
	var url = config.protocol + '://' + config.hostname + ':' + (config.port || 80) + '/' + config.serviceBase;

    this._CONFIG.baseUrl = url;

    this.SVC = {
        login: url+'api/login'
    }
};

var Connection = AlfJS.Connection.prototype;

Connection.getConfig = function() {
	return this._CONFIG;
};

Connection.setTicket = function(ticketData) {
    this._LOGIN_TICKET = ticketData.data.ticket;
};

Connection.login = function(cbSuccess, cbError) {
    var loginData = {
            username: this._CONFIG.login,
            password: this._CONFIG.password
    };

    var _self = this;

    AlfJS.request({
        url: this.SVC.login,
        type: 'json',
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify(loginData),
        success: function(data){
            _self.setTicket(data);
            cbSuccess();
        },
        error: function(err) {
            cbError(err);
        }
    });
};
