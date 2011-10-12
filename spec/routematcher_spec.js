var winston = require('winston'),
	RouteMatcher = require('../lib/routematcher');

describe('when matching', function() {

	var options, matcher;

	it('should return a hash with the resolved route (no prefix)', function() {
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

	it('should return a hash with the resolved route (prefix)', function() {
		var result;

		options = {
			pathprefix: 'api',
			logger: new winston.Logger({ transports: [] }),
			schema: require('7digital-api')
		};
		matcher = new RouteMatcher(options);
		result = matcher.match({ pathname: '/api/artist/details' });
		expect(result).toBeDefined();
		expect(result.resource).toEqual('artist');
		expect(result.action).toEqual('details');
		expect(result.resourceClassName).toEqual('Artists');
		expect(result.apiMethodName).toEqual('getDetails');
	});

	it('should return undefined when no resolved route (no prefix)', function() {
		var result;

		options = {
			pathprefix: '',
			logger: new winston.Logger({ transports: [] }),
			schema: require('7digital-api')
		};
		matcher = new RouteMatcher(options);
		result = matcher.match({ pathname: '/api/artist/fail' });
		expect(result).not.toBeDefined();
	});

	it('should return undefined when no resolved route (prefix)', function() {
		var result;

		options = {
			pathprefix: 'api',
			logger: new winston.Logger({ transports: [] }),
			schema: require('7digital-api')
		};
		matcher = new RouteMatcher(options);
		result = matcher.match({ pathname: '/api/artist/fail' });
		expect(result).not.toBeDefined();
	});

	it('should return undefined when route matches (omitted prefix)', 
		function() {
		var result;

		options = {
			pathprefix: 'api',
			logger: new winston.Logger({ transports: [] }),
			schema: require('7digital-api')
		};
		matcher = new RouteMatcher(options);
		result = matcher.match({ pathname: '/artist/details' });
		expect(result).not.toBeDefined();
	});
});
