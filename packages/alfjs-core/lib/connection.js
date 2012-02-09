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
	password: 's3cr3t',
    format: 'json'|'jsonp'
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
        },
        node:{
            endpoint: 'slingshot/doclib2/node/',
            method: 'get',
            type: 'json',
            contentType: 'application/json'
        }

    }
};

/**
  @function

  Returns the Connection instances' configuration data.

  @returns {Object}
*/
Connection.getConfig = function() {
	return this._CONFIG;
};

/**
  @function

  @param {Object} ticketData Any object containing the Alfresco ticket data.
*/
Connection.setTicket = function(ticketData) {
    this._LOGIN_TICKET = ticketData.data.ticket;
};

/**
  @function

  Returns the Connection login ticket.

  @returns {String} The login ticket string.
*/
Connection.getTicket = function() {
    return this._LOGIN_TICKET;
};


/**
  @function

  Invokes a given Alfresco service.

 @param {Object} ctx An object containing the context information required to properly invoke the service.
 This takes the form:
 {
    service: 'serviceName',
    action: 'actionName',
    path: 'whatever/needs/to/be/appended',
    data: 'some data string, object, etc.',
    success: someSuccessFunction(),
    error: someErrorFunction()
 }

 @see Connection.SVC
*/
Connection.invoke = function(ctx) {
    var svc = this.SVC[ctx.service][ctx.action];
    var config = this.getConfig();
    var format = config.format || 'json';

    var path = ctx.path || '';

    if (ctx.service != 'authentication') {
        path += '?alf_ticket='+this.getTicket();
    }

    var request = {
        url: this._CONFIG.baseUrl + svc.endpoint + path,
        type: svc.type || 'json',
        method: svc.method || 'get',
        contentType: svc.contentType || undefined,
        data: ctx.data,
        success: ctx.success,
        error: ctx.error
    };

    // Check that the desired format is jsonp and that this service is configured for JSON (vs. XML) as only JSON services can be wrapped in a callback.
    if (format == 'jsonp' && svc.type == 'json') {
        request.type = 'jsonp';
        request.jsonp = 'alf_callback';
        request.jsonpCallback = 'CbAlfjs';
    }

    AlfJS.request(request);
};

/**
  @function

  Logs the user into Alfresco and obtains a ticket which is persisted internally.

  @param {Function} cbSuccess Callback to invoke when login successful.

  @param {Function} cbError Callback to invoke when login fails.
*/
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


/**
  @function

  Logs the user out Alfresco.

  @param {Function} cbSuccess Callback to invoke when logout successful.

  @param {Function} cbError Callback to invoke when logout fails.
*/
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

/**
  @function

  Retrieves a list of documents under a given sites' folder structure.

 @param {Object} ctx An object containing the context information required to properly invoke the service.
 This takes the form:
 {
    site: 'my_site_name',
    model: 'cm:content',
    container: 'documentLibrary|wiki|etc.',
    folder: 'Some/Child/Of/Container,

 }
 @param {Function} cbSuccess Callback function invoked when action succeeds.
 @param {Function} cbError Callback function invoked when action fails.
*/
Connection.docList = function(ctx, cbSuccess, cbError) {
    var site = ctx.site;

    var model = ctx.model || 'cm:content';
    var container = ctx.container || 'documentLibrary'
    var folder = ctx.folderPath || '';

    if (site) {
        this.invoke({
            service: 'doclib',
            action: 'doclist',
            path: model + '/site/' + site + '/' + container + '/' + folder,
            success: function(data) {
                if (cbSuccess) {
                    cbSuccess(data);
                }
            }, // end success function
            error: function(err) {
                if(cbError) {
                    cbError(err);
                }
            } // end error function
        }); // end invoke call
    } // end if(site)
};

/**
  @function

  Retrieves a specific node by its nodeRef.

 @param {String} nodeRef An Alfresco nodeRef of the form workspace://SpacesStore/80aaedad-cf8b-42f4-a3f4-88dc3c9f9d3b
 @param {Function} cbSuccess Callback function invoked when action succeeds.
 @param {Function} cbError Callback function invoked when action fails.
*/
Connection.node = function(nodeRef, cbSuccess, cbError) {
    // convert workspace://SpacesStore... to workspace/SpacesStore...
    var scrubbedNodeRef = nodeRef.replace(':/','');

    this.invoke({
        service: 'doclib',
        action: 'node',
        path: scrubbedNodeRef,
        success: function(data) {
            if (cbSuccess) {
                cbSuccess(data);
            }
        }, // end success function
        error: function(err) {
            if(cbError) {
                cbError(err);
            }
        } // end error function
    }); // end invoke call

};