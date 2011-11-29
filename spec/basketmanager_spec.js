var BasketManager = require('../lib/basketmanager');

describe('basketmanager', function() {

	it('should get the basketid from session', function() {
		var fakeSession = { basketId: '1234' },
			fakeBasketApi = {
				create: jasmine.createSpy()
			},
			basketManager = new BasketManager(fakeBasketApi, fakeSession);

		basketManager.getBasketId(function(err, basketId) {
			expect(err).toBeNull();
			expect(basketId).toEqual(fakeSession.basketId);
		});
	});

	it('should put the basketid in session', function() {
		var fakeSession = { },
			fakeBasketApi = {
				create: function(args, cb) {
					return cb(null, { basket: { id: '1234' } });
				}
			},
			basketManager = new BasketManager(fakeBasketApi, fakeSession);

		basketManager.getBasketId(function(err, basketId) {
			expect(err).toBeNull();
			expect(basketId).toEqual('1234');
		});
	});

});
