
(function(exports) {
/*!
  * Reqwest! A general purpose XHR connection manager
  * (c) Dustin Diaz 2011
  * https://github.com/ded/reqwest
  * license MIT
  */

if ('undefined' !== typeof window) {

    !function (name, definition) {
      if (typeof module != 'undefined') module.exports = definition()
      else if (typeof define == 'function' && define.amd) define(name, definition)
      else this[name] = definition()
    }('reqwest', function () {

      var context = this
        , win = window
        , doc = document
        , old = context.reqwest
        , twoHundo = /^20\d$/
        , byTag = 'getElementsByTagName'
        , readyState = 'readyState'
        , contentType = 'Content-Type'
        , requestedWith = 'X-Requested-With'
        , head = doc[byTag]('head')[0]
        , uniqid = 0
        , lastValue // data stored by the most recent JSONP callback
        , xmlHttpRequest = 'XMLHttpRequest'
        , defaultHeaders = {
              contentType: 'application/x-www-form-urlencoded'
            , accept: {
                  '*':  'text/javascript, text/html, application/xml, text/xml, */*'
                , xml:  'application/xml, text/xml'
                , html: 'text/html'
                , text: 'text/plain'
                , json: 'application/json, text/javascript'
                , js:   'application/javascript, text/javascript'
              }
            , requestedWith: xmlHttpRequest
          }
        , xhr = (xmlHttpRequest in win) ?
            function () {
              return new XMLHttpRequest()
            } :
            function () {
              return new ActiveXObject('Microsoft.XMLHTTP')
            }

      function handleReadyState(o, success, error) {
        return function () {
          if (o && o[readyState] == 4) {
            if (twoHundo.test(o.status)) {
              success(o)
            } else {
              error(o)
            }
          }
        }
      }

      function setHeaders(http, o) {
        var headers = o.headers || {}
        headers.Accept = headers.Accept || defaultHeaders.accept[o.type] || defaultHeaders.accept['*']
        // breaks cross-origin requests with legacy browsers
        if (!o.crossOrigin && !headers[requestedWith]) headers[requestedWith] = defaultHeaders.requestedWith
        if (!headers[contentType]) headers[contentType] = o.contentType || defaultHeaders.contentType
        for (var h in headers) {
          headers.hasOwnProperty(h) && http.setRequestHeader(h, headers[h])
        }
      }

      function generalCallback(data) {
        lastValue = data
      }

      function urlappend(url, s) {
        return url + (/\?/.test(url) ? '&' : '?') + s
      }

      function handleJsonp(o, fn, err, url) {
        var reqId = uniqid++
          , cbkey = o.jsonpCallback || 'callback' // the 'callback' key
          , cbval = o.jsonpCallbackName || ('reqwest_' + reqId) // the 'callback' value
          , cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)')
          , match = url.match(cbreg)
          , script = doc.createElement('script')
          , loaded = 0

        if (match) {
          if (match[3] === '?') {
            url = url.replace(cbreg, '$1=' + cbval) // wildcard callback func name
          } else {
            cbval = match[3] // provided callback func name
          }
        } else {
          url = urlappend(url, cbkey + '=' + cbval) // no callback details, add 'em
        }

        win[cbval] = generalCallback

        script.type = 'text/javascript'
        script.src = url
        script.async = true
        if (typeof script.onreadystatechange !== 'undefined') {
            // need this for IE due to out-of-order onreadystatechange(), binding script
            // execution to an event listener gives us control over when the script
            // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
            script.event = 'onclick'
            script.htmlFor = script.id = '_reqwest_' + reqId
        }

        script.onload = script.onreadystatechange = function () {
          if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
            return false
          }
          script.onload = script.onreadystatechange = null
          script.onclick && script.onclick()
          // Call the user callback with the last value stored and clean up values and scripts.
          o.success && o.success(lastValue)
          lastValue = undefined
          head.removeChild(script)
          loaded = 1
        }

        // Add the script to the DOM head
        head.appendChild(script)
      }

      function getRequest(o, fn, err) {
        var method = (o.method || 'GET').toUpperCase()
          , url = typeof o === 'string' ? o : o.url
          // convert non-string objects to query-string form unless o.processData is false
          , data = (o.processData !== false && o.data && typeof o.data !== 'string')
            ? reqwest.toQueryString(o.data)
            : (o.data || null);

        // if we're working on a GET request and we have data then we should append
        // query string to end of URL and not post data
        (o.type == 'jsonp' || method == 'GET')
          && data
          && (url = urlappend(url, data))
          && (data = null)

        if (o.type == 'jsonp') return handleJsonp(o, fn, err, url)

        var http = xhr()
        http.open(method, url, true)
        setHeaders(http, o)
        http.onreadystatechange = handleReadyState(http, fn, err)
        o.before && o.before(http)
        http.send(data)
        return http
      }

      function Reqwest(o, fn) {
        this.o = o
        this.fn = fn
        init.apply(this, arguments)
      }

      function setType(url) {
        var m = url.match(/\.(json|jsonp|html|xml)(\?|$)/)
        return m ? m[1] : 'js'
      }

      function init(o, fn) {
        this.url = typeof o == 'string' ? o : o.url
        this.timeout = null
        var type = o.type || setType(this.url)
          , self = this
        fn = fn || function () {}

        if (o.timeout) {
          this.timeout = setTimeout(function () {
            self.abort()
          }, o.timeout)
        }

        function complete(resp) {
          o.timeout && clearTimeout(self.timeout)
          self.timeout = null
          o.complete && o.complete(resp)
        }

        function success(resp) {
          var r = resp.responseText
          if (r) {
            switch (type) {
            case 'json':
              try {
                resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')')
              } catch(err) {
                return error(resp, 'Could not parse JSON in response', err)
              }
              break;
            case 'js':
              resp = eval(r)
              break;
            case 'html':
              resp = r
              break;
            }
          }

          fn(resp)
          o.success && o.success(resp)

          complete(resp)
        }

        function error(resp, msg, t) {
          o.error && o.error(resp, msg, t)
          complete(resp)
        }

        this.request = getRequest(o, success, error)
      }

      Reqwest.prototype = {
        abort: function () {
          this.request.abort()
        }

      , retry: function () {
          init.call(this, this.o, this.fn)
        }
      }

      function reqwest(o, fn) {
        return new Reqwest(o, fn)
      }

      // normalize newline variants according to spec -> CRLF
      function normalize(s) {
        return s ? s.replace(/\r?\n/g, '\r\n') : ''
      }

      var isArray = typeof Array.isArray == 'function' ? Array.isArray : function(a) {
        return a instanceof Array
      }

      function serial(el, cb) {
        var n = el.name
          , t = el.tagName.toLowerCase()
          , optCb = function(o) {
              // IE gives value="" even where there is no value attribute
              // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
              if (o && !o.disabled)
                cb(n, normalize(o.attributes.value && o.attributes.value.specified ? o.value : o.text))
            }

        // don't serialize elements that are disabled or without a name
        if (el.disabled || !n) return;

        switch (t) {
        case 'input':
          if (!/reset|button|image|file/i.test(el.type)) {
            var ch = /checkbox/i.test(el.type)
              , ra = /radio/i.test(el.type)
              , val = el.value;
            // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here
            (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
          }
          break;
        case 'textarea':
          cb(n, normalize(el.value))
          break;
        case 'select':
          if (el.type.toLowerCase() === 'select-one') {
            optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
          } else {
            for (var i = 0; el.length && i < el.length; i++) {
              el.options[i].selected && optCb(el.options[i])
            }
          }
          break;
        }
      }

      // collect up all form elements found from the passed argument elements all
      // the way down to child elements; pass a '<form>' or form fields.
      // called with 'this'=callback to use for serial() on each element
      function eachFormElement() {
        var cb = this
          , e, i, j
          , serializeSubtags = function(e, tags) {
            for (var i = 0; i < tags.length; i++) {
              var fa = e[byTag](tags[i])
              for (j = 0; j < fa.length; j++) serial(fa[j], cb)
            }
          }

        for (i = 0; i < arguments.length; i++) {
          e = arguments[i]
          if (/input|select|textarea/i.test(e.tagName)) serial(e, cb)
          serializeSubtags(e, [ 'input', 'select', 'textarea' ])
        }
      }

      // standard query string style serialization
      function serializeQueryString() {
        return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
      }

      // { 'name': 'value', ... } style serialization
      function serializeHash() {
        var hash = {}
        eachFormElement.apply(function (name, value) {
          if (name in hash) {
            hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
            hash[name].push(value)
          } else hash[name] = value
        }, arguments)
        return hash
      }

      // [ { name: 'name', value: 'value' }, ... ] style serialization
      reqwest.serializeArray = function () {
        var arr = []
        eachFormElement.apply(function(name, value) {
          arr.push({name: name, value: value})
        }, arguments)
        return arr
      }

      reqwest.serialize = function () {
        if (arguments.length === 0) return ''
        var opt, fn
          , args = Array.prototype.slice.call(arguments, 0)

        opt = args.pop()
        opt && opt.nodeType && args.push(opt) && (opt = null)
        opt && (opt = opt.type)

        if (opt == 'map') fn = serializeHash
        else if (opt == 'array') fn = reqwest.serializeArray
        else fn = serializeQueryString

        return fn.apply(null, args)
      }

      reqwest.toQueryString = function (o) {
        var qs = '', i
          , enc = encodeURIComponent
          , push = function (k, v) {
              qs += enc(k) + '=' + enc(v) + '&'
            }

        if (isArray(o)) {
          for (i = 0; o && i < o.length; i++) push(o[i].name, o[i].value)
        } else {
          for (var k in o) {
            if (!Object.hasOwnProperty.call(o, k)) continue;
            var v = o[k]
            if (isArray(v)) {
              for (i = 0; i < v.length; i++) push(k, v[i])
            } else push(k, o[k])
          }
        }

        // spaces should be + according to spec
        return qs.replace(/&$/, '').replace(/%20/g,'+')
      }

      // jQuery and Zepto compatibility, differences can be remapped here so you can call
      // .ajax.compat(options, callback)
      reqwest.compat = function (o, fn) {
        if (o) {
          o.type && (o.method = o.type) && delete o.type
          o.dataType && (o.type = o.dataType)
          o.jsonpCallback && (o.jsonpCallbackName = o.jsonpCallback) && delete o.jsonpCallback
          o.jsonp && (o.jsonpCallback = o.jsonp)
        }
        return new Reqwest(o, fn)
      }

      reqwest.noConflict = function () {
        context.reqwest = old
        return this
      }

      return reqwest
    })
}

})({});


(function(exports) {
})({});

(function(exports) {
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


})({});


(function(exports) {
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
AlfJS.Connection = function(config) {
    this._LOGIN_TICKET = undefined;

	this._CONFIG = config;

    config.format = config.format || 'json';

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

})({});


(function(exports) {
})({});

(function(exports) {
/*
	{
        url: 'http://example.com:8080/alfresco,
        type: 'json',
        method: 'get',
        contentType: 'application/json',
		headers: {
			key: 'value'
		},
        data: data,
        success: successCallbackFunction,
        error: errorCallbackFunction
    }
*/


var root = this;

var isNode = false;

// Detect if running on NodeJS
if (typeof module !== 'undefined' && module.exports) {
	
	var request = require('request');
	
	var nodeRequestWrapper = function(req) {
		
		// Map inbound request config to outbound request config.
		
		var headers = req.headers || {};
		headers['Content-type']=req.contentType;
		
		var json = false;
		
		var reqOptions = {
			url: req.url,
			method: req.method,
			headers: headers
		}
		
		if (req.type === 'json') {
			reqOptions.json = JSON.parse(req.data);
		} else {
			reqOptions.body = req.data;
		}
		
		request(reqOptions, function(error, response, body){
			if (error && req.err) {
				req.err(error);
			} else {
				req.success(body);
			}
		}); // end request
	};
	
	AlfJS.request = nodeRequestWrapper;
	
} else {
	// We're running on the browser.
	AlfJS.request = reqwest;
	AlfJS.ajax = reqwest.compat;
}



})({});


(function(exports) {
})({});
