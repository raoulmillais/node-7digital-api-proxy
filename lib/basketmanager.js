// Manages the basket in connect session middleware and handles automatic
// creation of the Basket for the basket-related actions
//
// @constructor
// @param {Object} options
function BasketManager(basketApi, session) {
	this.basketApi = basketApi;
	this.session = session;
}

// Get the basket id if it exists in session otherwise create one using the
// basket API and put it in session.
//
// @param {String} url
// @return {String} basketId
BasketManager.prototype.getBasketId = function (callback) {
	var self = this;
	if (this.session.basketId) {
		return callback(null, this.session.basketId);
	}

	this.basketApi.create({}, function(err, response) {
		if (!err && response.basket) {
			self.session.basketId = response.basket.id;
			return callback(null, response.basket.id);
		}

		return callback(err || response);
	});
};

module.exports = BasketManager;
