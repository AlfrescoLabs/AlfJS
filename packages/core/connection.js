var AlfJS = (function (alf) {
	/*
	    AlfJS.Connection is a low-level API for accessing Alfresco services.
	    It does not offer any high-level models, ORM or the like.

	    DEVELOPER CONVENTIONS

	    Any AlfJS.Connection methods that invoke repository-side services MUST be named such that the function is
	    preceded by a verb that maps into CRUD and hence the HTTP method used to invoke said service.

	    eg.
	        getNode(); // HTTP GET
	        createNode(); // HTTP PUT
	        deleteNode(); // HTTP DELETE
	        updateNode(); // HTTP POST
	*/

	/**
	  @function
  
	  Sets the configuration data for a given Alfresco connection.

	  @param {Object} config The configuration data for a given Alfresco connection.
	  This is an object of the form:
	  {
	  	hostname: 'localhost',
	  	port: 8080,
		protocol: 'http', // Can also be 'https'
		serviceBase: 'alfresco/service/',
		login: 'userid',
		password: 's3cr3t',
	    format: 'json'|'jsonp',
		headers: {
			 'X-Sample-SSL-Enabled-Header': 'header value',  // Some ajax and reverse proxies use headers to flag a request as requiring ssl.
			 'X-Some-Other-Header': 'Some Value'
		}
	  }
  
	  TODO Update configuration to this:
	  {
	  	hostname: 'localhost',
	  	port: 8080,
		protocol: ['http']|'https',
		serviceBase: 'alfresco/service/',
		login: 'userid',
		password: 's3cr3t',
	    format: ['json']|'jsonp',
		headers: {
			 'X-Sample-SSL-Enabled-Header': 'header value',  // Some ajax and reverse proxies use headers to flag a request as requiring ssl.
			 'X-Some-Other-Header': 'Some Value'
		},
		proxy: {
			enabled: true|[false],
			type: ['ajax']|'reverse'|'forward',   // For now, ajax and reverse proxies are treated the same.
			endpoint: '/example/proxy/endpoint/path',
			includeProtocol: true|[false],   // Include http:// or https:// in the url.
		}
	  }
  
	*/
	alf.Connection = function(config) {
	    this._LOGIN_TICKET = undefined;

		this._CONFIG = config;

	    config.format = config.format || 'json';

		var url = config.protocol + '://' + config.hostname + ':' + (config.port || 80) + '/' + config.serviceBase;

	    this._CONFIG.baseUrl = (config.prefix || '') + url;

	};

	var Connection = alf.Connection.prototype;

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

	    },
	    people: {
	        sites: {
	            endpoint: 'api/people',
	            method: 'get',
	            type: 'json',
	            contentType: 'application/json'
	        }
	    },

	    sites: {
	        sites: {
	            endpoint: 'api/sites',
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
	    var format = config.format;

	    var data = ctx.data || {};
	    var params = ctx.params || {};
	    var path = ctx.path || '';

	    var paramString = '';

	    // JSONP is invoked via a GET request. That means we need to make sure we inject the auth ticket in the correct manner.
	    // Passing the ticket via the 'data' hash is good for any invocation that uses GET.
	    // Otherwise, use a separate 'params' hash to pass along any necessary request parameters.

	    // TODO This method of identifying requests is probably not 100% correct.
	    // TODO Consider using something like useJSONP:true|false

	    if (ctx.service != 'authentication') {
	        if (format == 'jsonp') {
	            data.alf_ticket=this.getTicket();
	        } else {
	            params.alf_ticket=this.getTicket();
	        }
	    }

	    var key = '';

	    // Merge params into data on GETor JSONP requests.
	    if (svc.method == 'get' || format == 'jsonp') {
	        for (key in params) {
	            data[key] = params[key];
				params = {}; // clear out the params hash as it's no longer needed
	        }
	    }

	    // We want to pass the JSON payload as a string for regular json requests.
	    if (svc.method == 'post' && format == 'json') {
	        data = JSON.stringify(data);
	    }

	    // Construct additional URL parameters from the 'params' hash.
	    for (key in params) {
	        paramString += '&'+key+'='+params[key];
	    }

	    if (paramString.substring(0,1) == '&') {
	        paramString = '?'+paramString.substring(1)
	    }

	    var request = {
	        url: this._CONFIG.baseUrl + svc.endpoint + path + paramString,
	        type: svc.type || 'json',
	        method: svc.method || 'get',
	        contentType: svc.contentType || undefined,
			headers: this._CONFIG.headers || undefined,
	        data: data,
	        success: ctx.success,
	        error: ctx.error
	    };

	    // Check that the desired format is jsonp and that this service is configured for JSON (vs. XML) as only JSON services can be wrapped in a callback.
	    if (format == 'jsonp' && svc.type == 'json') {
	        request.type = 'jsonp';
	        request.jsonpCallback = 'alf_callback';
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

	    var config = this.getConfig();

	    var loginDataPOST = {
	            username: config.login,
	            password: config.password
	    };

	    var loginDataGET = {
	            u: config.login,
	            pw: config.password
	    };

	    var _self = this;

	    var cfg = {
	        service: 'authentication',
	        action: 'login',
	        data: (this.getConfig().format == 'json')? loginDataPOST : loginDataGET,
	        params: {format:'json'},
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
	    };

	    this.invoke(cfg)
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
	Connection.getDocList = function(ctx, cbSuccess, cbError) {
	    var site = ctx.site;

	    var model = ctx.model || 'cm:content';
	    var container = ctx.container || 'documentLibrary'
	    var folder = ctx.folderPath || '/';

	    if (site) {
	        this.invoke({
	            service: 'doclib',
	            action: 'doclist',
	            path: model + '/site/' + site + '/' + container + folder,
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
	Connection.getNode = function(nodeRef, cbSuccess, cbError) {
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

	/**
	  @function

	  Retrieves the sites the user explicitly belongs to.

	  @param {Function} cbSuccess Callback to invoke when login successful.

	  @param {Function} cbError Callback to invoke when login fails.
	*/
	Connection.getUserSites = function(cbSuccess, cbError) {

	    var config = this.getConfig();

	    var cfg = {
	        service: 'people',
	        action: 'sites',
	        path: config.username + '/sites',
	        success: function(data){
	            if (cbSuccess) {
	                cbSuccess(data);
	            }
	        },
	        error: function(err) {
	            if (cbError) {
	                cbError(err);
	            }
	        }
	    };

	    this.invoke(cfg)
	};

	/**
	  @function

	  Retrieves the all sites in the repository.

	  @param {Function} cbSuccess Callback to invoke when login successful.

	  @param {Function} cbError Callback to invoke when login fails.
	*/
	Connection.getSites = function(cbSuccess, cbError) {

	    var config = this.getConfig();

	    var cfg = {
	        service: 'sites',
	        action: 'sites',
	        success: function(data){
	            if (cbSuccess) {
	                cbSuccess(data);
	            }
	        },
	        error: function(err) {
	            if (cbError) {
	                cbError(err);
	            }
	        }
	    };

	    this.invoke(cfg)
	};
	return alf;
}(AlfJS || {}));
