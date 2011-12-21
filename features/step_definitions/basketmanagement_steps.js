var request = require('request'),
	assert = require('assert');

module.exports = function basketManagementSteps() {

	this.Given(/^I have no basket$/, function (callback) {
		callback();
	});

	this.Given(/^I add an item to my basket$/, function (callback) {
		var theWorld = this;
		request('http://localhost:3000/basket/addItem' +
				'?releaseid=160553&trackid=1693930',
			function handleResponse(err, res, body) {
			if (err) {
				console.log(err);
				throw new Error(err);
			}
			theWorld.response = res;
			theWorld.responseBody = JSON.parse(body.trim());
			callback();
		});
	});

	this.Then(/^I should get a basket$/, function (callback) {
		assert.ok(this.responseBody.basket);
		assert.ok(this.responseBody.basket.basketItems);
		callback();
	});

};

