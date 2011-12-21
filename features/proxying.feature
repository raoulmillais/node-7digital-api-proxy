Feature: Proxying requests
	In order to build AJAX music stores
	As an API customer
	I want to proxy requests to the APi

	Background:
		Given I am running the proxy server

	Scenario:
		Given I request artist details
		Then I should see the "artist-details" response
		And I should shutdown the server
