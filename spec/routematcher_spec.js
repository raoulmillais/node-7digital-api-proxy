var winston = require('winston'),
	RouteMatcher = require('../lib/routematcher');

describe('when matching', function() {

	var options, matcher;

	it('should return a hash with the resolved route', function() {
		var result;

		options = {
			pathprefix: '',
			logger: new winston.Logger({ transports: [] }),
			schema: require('7digital-api')
		};
		matcher = new RouteMatcher(options);
		result = matcher.match({ pathname: '/artist/details' });
		expect(result).toBeDefined();
		expect(result.resource).toEqual('artist');
		expect(result.action).toEqual('details');
		expect(result.resourceClassName).toEqual('Artists');
		expect(result.apiMethodName).toEqual('getDetails');
	});

});
