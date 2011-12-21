var eyes = require('eyes'),
	url = require('url'),
	underscore = require('underscore'),
	querystring = require('querystring'),
	logger = require('./logger'),
	RouteMatcher = require('./routematcher'),
	BasketManager = require('./basketmanager');

// Will proxy the request through to the API if the request url matches
// a valid url on the remote API.
//
// Examples:
//
//     connect.createServer(
//         apiproxy.proxy(api)
//     );
//
// @param {Object} schema
// @param {String} [oauthkey]
// @param {String} [oauthsecret]
// @param {String} [pathprefix]
// @param {Object} [cacheManager]
// @return {Function}
// @api public
module.exports = function proxy(options) {
	var api,
		route,
		key,
		defaults = {
			schema: require('7digital-api'),
			pathprefix: '',
			logger: logger,
			cacheManager: null
		}, matcher;

	options = options || {};
	underscore.defaults(options, defaults);

	api = options.schema;
	matcher = new RouteMatcher(options);

	return function handleApiCall(req, res, next) {
		var apiResource,
			apiRequestParameters,
			reqUrl = url.parse(req.url),
			wrapperDefinition = matcher.match(reqUrl);

		// Check if this is an API call
		if (!wrapperDefinition) {
			next();
			return;
		}

		// Create the resource class and the json representation of the querystring
		apiResource = new api[wrapperDefinition.resourceClassName]();
		apiRequestParameters = querystring.parse(reqUrl.query);

		if (!options.callback) {
			// We need to set the default callback here instead of
			// on the details so we can capture the res parameter
			// in the closure.
			options.callback = require('./jsoncallback')(req, res, options.logger);
		}

		var callbackContext = {
			req: req,
			res: res,
			resourceSlug: wrapperDefinition.resource,
			actionSlug: wrapperDefinition.action,
			apiCall: wrapperDefinition.resource + '/' +
				wrapperDefinition.action
		}, boundCallback = underscore.bind(options.callback, callbackContext);

		function getDataFromApi(callback) {

			options.logger.info('Calling remote API');

			// TODO: This if statement is an abomination: clean it up!
			if (wrapperDefinition.resourceSlug === 'basket' &&
				wrapperDefinition.actionSlug !== 'create' &&
				!apiRequestParameters.basketId) {
				var basketManager = new BasketManager(apiResource, req.session);
				basketManager.getBasketId(function(err, basketId) {
					apiRequestParameters.basketId = basketId;
					apiResource[wrapperDefinition.apiMethodName](
						apiRequestParameters, boundCallback);
				});
			} else {
				apiResource[wrapperDefinition.apiMethodName](
					apiRequestParameters, boundCallback);
			}
		}

		getDataFromApi(boundCallback);

		return;
	};
};
