describe('custom callback', function () {

	it('should bind the context', function() {
		var callBackDone = false,
			fakeReq = {
				url: '/artist/details?artistId=1'
			},
			fakeRes = {},
			proxy = require('../lib/apiproxy')({
				callback: function(err, data) {
					expect(this.req).toBe(fakeReq);
					expect(this.res).toBe(fakeRes);
					expect(this.actionSlug).toEqual('details');
					expect(this.apiCall).toEqual('artist/details');
					expect(this.resourceSlug).toEqual('artist');
					callBackDone = true;
				}
			});

		proxy(fakeReq, fakeRes);

		waitsFor(function() {
			return callBackDone == true;
		}, "Callback was never called", 5000);
	});

});
