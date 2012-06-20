var AlfJS = (function (alf) {

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
	
		alf.request = nodeRequestWrapper;
	
	} else {
		// We're running on the browser.
		alf.request = window.reqwest;
		alf.ajax = window.reqwest.compat;
	}
	return alf;
}(AlfJS || {}));


