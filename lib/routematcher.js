// Creates a matcher for matching URLs to calls on the 7digital API wrapper.
//
// `options hash`
// - pathprefix
// - schema
// - logger
//
// @constructor
// @param {Object} options
function RouteMatcher(options) {
	this.options = options;
	if (options.pathprefix) {
		this.routePattern = new RegExp("^\\/" + this.options.pathprefix +
			"\\/([a-zA-Z0-9\\-_]+)(\\/[a-zA-Z0-9\\-_]+)?");
	} else {
		this.routePattern = /^\/([a-zA-Z0-9\-_]+)(\/[a-zA-Z0-9\-_]+)?/;
	}
}

// Given a url, parse the different components to provide a definition hash
// with the name of the class and method on the API wrapper that corresponds
// to the URL.
//
// @param {String} url
// @return {Object}
RouteMatcher.prototype.match = function (url) {
	var resourceSlug,
		actionSlug,
		api = this.options.schema,
		resourceClassName,
		apiMethodName,
		match,
		route;

	match = url.pathname.match(this.routePattern);
	// Check if this is an API call
	if (!match  || match.length !== 3) {
		return;
	}

	resourceSlug = match[1].toLowerCase();
	actionSlug = (match[2] || '/').substr(1).toLowerCase();

	this.options.logger.silly(match);

	resourceClassName = api.getResourceClassName(resourceSlug);
	if (!resourceClassName) {
		this.options.logger.silly('No matching api resource');
		return;
	}

	apiMethodName = api.getActionMethodName(resourceClassName, actionSlug);
	if (!apiMethodName) {
		this.options.logger.silly('No matching api action on resource');
		return;
	}

	return {
		resource: resourceSlug,
		action: actionSlug,
		resourceClassName: resourceClassName,
		apiMethodName: apiMethodName
	};
};

module.exports = RouteMatcher;
