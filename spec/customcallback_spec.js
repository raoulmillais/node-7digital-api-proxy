describe('custom callback', function () {

	it('should bind the context', function() {
		var callBackDone = false,
			proxy = require('../lib/apiproxy')({
				callback: function(err, data) {
					expect(this.req).toBeDefined();
					expect(this.res).toBeDefined();
					expect(this.actionSlug).toEqual('details');
					expect(this.apiCall).toEqual('artist/details');
					expect(this.resourceSlug).toEqual('artist');
					callBackDone = true;
				}
			}),
			fakeReq = {
				url: '/artist/details?artistId=1'
			};

		proxy(fakeReq, {});
		
		waitsFor(function() {
			return callBackDone == true;
		}, "Callback was never called", 5000);
	});

});
