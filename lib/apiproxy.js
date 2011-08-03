"use strict";

/**
 * Module dependencies.
 */
var Api = require('7digital-api').Api,
	eyes = require('eyes'),
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
module.exports = function proxy(schema, pathprefix, cacheManager) {
	var api, route;

	if (pathprefix) {
		route = new RegExp("^\\/" + pathprefix +
			"\\/([a-zA-Z0-9\\-_]+)(\\/[a-zA-Z0-9\\-_]+)?");
	} else {
		route = /^\/([a-zA-Z0-9\-_]+)(\/[a-zA-Z0-9\-_]+)?/;
	}

	api = schema;

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

		function sendDataToClient(err, data) {
			var responseText = JSON.stringify(err || data);
			console.log('Response received');

			res.writeHead(200, {
				'Content-Length': Buffer.byteLength(responseText, 'utf8'),
				'Content-Type': 'application/json' });
			res.write(responseText, 'utf8');
			res.end();
		}
		
		function getDataFromApi(callback) {
			console.log('Calling remote API');
			apiResource[apiMethodName](apiRequestParameters, callback);
		}

		if (cacheManager) {
			console.log('checking cache');
			cacheManager.getOrSet(url, getDataFromApi, sendDataToClient);
		} else {
			getDataFromApi(sendDataToClient);
		}

		return;
	}
};
