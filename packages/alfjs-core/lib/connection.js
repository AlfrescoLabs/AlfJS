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

    this._CONFIG.baseUrl = (config.prefix || '') + url;

};

var Connection = AlfJS.Connection.prototype;

Connection.SVC = {
    authentication: {
        login: {
            endpoint: 'api/login',
            method: 'post',
            type: 'json',
            contentType: 'application/json'
        },
        logout: {
            endpoint: 'api/login',
            method: 'delete',
            type: 'json',
            contentType: 'application/json'
        }
    },
    doclib: {
        doclist: {
            endpoint: 'slingshot/doclib2/doclist/',
            method: 'get',
            type: 'json',
            contentType: 'application/json'
        }

    }
};

Connection.getConfig = function() {
	return this._CONFIG;
};

Connection.setTicket = function(ticketData) {
    this._LOGIN_TICKET = ticketData.data.ticket;
};

Connection.getTicket = function() {
    return this._LOGIN_TICKET;
};

Connection.invoke = function(ctx) {
    var svc = this.SVC[ctx.service][ctx.action];

    var path = ctx.path || '';

    if (ctx.service != 'authentication') {
        path += '?alf_ticket='+this.getTicket();
    }

    AlfJS.request({
        url: this._CONFIG.baseUrl + svc.endpoint + path,
        type: svc.type || 'json',
        method: svc.method || 'get',
        contentType: svc.contentType || undefined,
        data: ctx.data,
        success: ctx.success,
        error: ctx.error
    });
};

Connection.login = function(cbSuccess, cbError) {
    var loginData = {
            username: this._CONFIG.login,
            password: this._CONFIG.password
    };

    var _self = this;

    this.invoke({
        service: 'authentication',
        action: 'login',
        data: JSON.stringify(loginData),
        success: function(data){
            _self.setTicket(data);
            if (cbSuccess) {
                cbSuccess(data);
            }
        },
        error: function(err) {
            if (cbError) {
                cbError(err);
            }
        }
    })
};

Connection.logout = function(cbSuccess, cbError) {
    this.invoke({
        service: 'authentication',
        action: 'logout',
        path: this.getTicket(),
        success: function(data){
            if (cbSuccess) {
                cbSuccess(data);
            }
        },
        error:function(err) {
            if (cbError) {
                cbError(err);
            }
        }

    });
};
Connection.docList = function(ctx, cbSuccess, cbError) {
    var site = ctx.site;

    var model = ctx.model || 'cm:content';
    var container = ctx.container || 'documentLibrary'
    var folder = ctx.folderPath || '';
    console.log("ticket:"+this.getTicket());
    if (site) {
        this.invoke({
            service: 'doclib',
            action: 'doclist',
            path: model + '/site/' + site + '/' + container + '/' + folder,
            success: function(data) {
                if (cbSuccess) {
                    cbSuccess(data);
                }
            },
            error: function(err) {
                if(cbError) {
                    cbError(err);
                }
            }
        });
    }

};
