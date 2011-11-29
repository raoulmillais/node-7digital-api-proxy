var underscore = require('underscore');

function JSONProxy(req, res, logger) {
	this.req = req;
	this.res = res;
	this.logger = logger;
	this.logger.log('Using the json proxy callback');
}

JSONProxy.prototype.callback = function (err, data) {
	var responseText = JSON.stringify(err || data);
	this.logger.info('Response received');

	this.res.writeHead(200, {
		'Content-Length': Buffer.byteLength(responseText, 'utf8'),
		'Content-Type': 'application/json'
	});

	this.res.write(responseText, 'utf8');
	this.res.end();
};

// Returns the default callback for proxying API requests and returning JSON
// strings to the consumer.
//
// @return {Function} the callback for the API proxy to use
module.exports = function(req, res, logger) {
	var jsonProxy = new JSONProxy(req, res, logger);

	return underscore.bind(jsonProxy.callback, jsonProxy);
};

