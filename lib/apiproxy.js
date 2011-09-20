var eyes = require('eyes'),
	url = require('url'),
	underscore = require('underscore'),
	querystring = require('querystring'),
	logger = require('./logger'),
	RouteMatcher = require('./routematcher');

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
			options.callback = function (err, data) {
				var responseText = JSON.stringify(err || data);
				options.logger.info('Response received');


				this.res.writeHead(200, {
						'Content-Length': Buffer.byteLength(responseText, 'utf8'),
						'Content-Type': 'application/json'
					});
				this.res.write(responseText, 'utf8');
				this.res.end();
			};
			options.logger.info('Using the default callback');
		}

		// TODO: Remove this, were lazy creating a basket and storing its id
		// in session in the big if below
		function putBasketIdInSession(err, data) {
			if (err) {
				options.callback.call(this, err, data);
				return;
			}

			if (data.basket && (
				!this.req.session.basketId ||
				this.req.session.basketId !== data.basket.id)) {
				options.logger.info('Storing basketId in session: ' +
					data.basket.id);
				this.req.session.basketId = data.basket.id;
			}

			options.callback.call(this, err, data);
		}

		function getDataFromApi(callback) {
			var callbackContext = {
				req: req,
				res: res,
				resourceSlug: wrapperDefinition.resourceSlug,
				actionSlug: wrapperDefinition.actionSlug,
				apiCall: wrapperDefinition.resourceSlug + '/' +
					wrapperDefinition.actionSlug
			}, boundCallback = underscore.bind(callback, callbackContext);

			options.logger.info('Calling remote API');

			// TODO: This if statement is an abomination: clean it up!
			if (wrapperDefinition.resourceSlug === 'basket' &&
				wrapperDefinition.actionSlug !== 'create' &&
				!apiRequestParameters.basketId) {
				if (req.session.basketId) {
					options.logger.info('Getting basketId from session: ' +
						req.session.basketId);
					apiRequestParameters.basketId = req.session.basketId;
					apiResource[wrapperDefinition.apiMethodName](
						apiRequestParameters, boundCallback);
				} else {
					options.logger.info('No basketId found calling create ' +
					'instead');
					apiResource.create({}, function (err, data) {
						if (!err && data.basket) {
							options.logger.info('Storing basketId in session: ' +
								data.basket.id);
							req.session.basketId = data.basket.id;
							apiRequestParameters.basketId = req.session.basketId;
							apiResource[wrapperDefinition.apiMethodName](
								apiRequestParameters, boundCallback);
						}
					});
				}
			} else {
				apiResource[wrapperDefinition.apiMethodName](
					apiRequestParameters, boundCallback);
			}
		}

		getDataFromApi(putBasketIdInSession);

		return;
	};
};
