"use strict";

/**
 * Module dependencies.
 */
var eyes = require('eyes'),
	url = require('url'),
	querystring = require('querystring'),
	StringUtils = require('./stringutils').StringUtils,
	FnUtils = require('./fnutils').FnUtils;

/**
 * Will proxy the request through to the API if the request url matches
 * a valid url on the remote API.
 *
 * Examples:
 *
 *     connect.createServer(
 *         apiproxy.proxy(api)    
 *     );
 *
 * @param {Object} schema
 * @param {String} [oauthkey]
 * @param {String} [oauthsecret]
 * @param {String} [pathprefix]
 * @param {Object} [cacheManager]
 * @return {Function}
 * @api public
 */
module.exports = function proxy(options) {
	var api, 
		route,
		key,
		pHop = Object.prototype.hasOwnProperty,
		defaults = {
			schema: require('7digital-api'),
			pathprefix: '',
			cacheManager: null
		};

	if (options) {
		for (key in defaults) {
			if (!pHop.call(options, key)) {
				options[key] = defaults[key];
			}
		}
	} else {
		options = defaults;
	}

	if (options.pathprefix) {
		route = new RegExp("^\\/" + options.pathprefix +
			"\\/([a-zA-Z0-9\\-_]+)(\\/[a-zA-Z0-9\\-_]+)?");
	} else {
		route = /^\/([a-zA-Z0-9\-_]+)(\/[a-zA-Z0-9\-_]+)?/;
	}

	api = options.schema;

	return function handleApiCall(req, res, next) {
		var resourceSlug,
			actionSlug,
			resourceClassName,
			apiMethodName,
			apiResource,
			apiRequestParameters,
			reqUrl = url.parse(req.url),
			match = reqUrl.pathname.match(route);

		// Check if this is an API call
		if (!match  || match.length != 3) {
			next();
			return;
		}

		resourceSlug = match[1];
		actionSlug = (match[2] || '/').substr(1);

		resourceClassName = api.getResourceClassName(resourceSlug);
		if (!resourceClassName) {
			next();
			return;
		}

		apiMethodName = api.getActionMethodName(resourceClassName, actionSlug);
		if (!apiMethodName) {
			next();
			return;
		}

		// Create the resource class and the json representation of the querystring
		apiResource = new api[resourceClassName]();
		apiRequestParameters = querystring.parse(reqUrl.query);

		if (!options.callback) {
			// We need to set the default callback here instead of
			// on the details so we can capture the res parameter
			// in the closure.
			options.callback = function(err, data) {
				var responseText = JSON.stringify(err || data);
				console.log('Response received');

				res.writeHead(200, {
					'Content-Length': Buffer.byteLength(responseText, 'utf8'),
					'Content-Type': 'application/json' });
				res.write(responseText, 'utf8');
				res.end();
			};
			console.log('Using the default callback');
		}

		function getDataFromApi(callback) {
			var callbackContext = {
				req: req,
				res: res
			};

			console.log('Calling remote API');
			apiResource[apiMethodName](apiRequestParameters, FnUtils.bind(callbackContext, callback));
		}

		if (options.cacheManager) {
			console.log('checking cache');
			options.cacheManager.getOrSet(url, getDataFromApi, options.callback);
		} else {
			getDataFromApi(options.callback);
		}

		return;
	};
};
