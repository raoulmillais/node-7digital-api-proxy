Feature: Basket management
	In order to build AJAX music stores
	As an API customer
	I want the proxy to manage my basket

	Background:
		Given I am running the proxy server

	Scenario:
		Given I have no basket
		And I add an item to my basket
		Then I should get a basket
