var spawn = require('child_process').spawn,
	request = require('request'),
	assert = require('assert'),
	path = require('path'),
	fs = require('fs');

module.exports = function initialize() {
	this.Given(/^I am running the proxy server$/, function (callback) {
		this.proxyServer = spawn('node', [ './examples/proxyserver.js', {
			cwd: path.join(__dirname, '../')
		} ]);
		this.proxyServer.stdout.on('data', function childOutput(data) {
			console.log('proxy out: ' + data);
		});
		this.proxyServer.stderr.on('data', function childErr(data) {
			throw new Error(data);
		});
		console.log('started proxy');
		setTimeout(function waitForProcessToStart() {
			callback();
		}, 1000);
	});

	this.Given(/^I request artist details$/, function (callback) {
		var theWorld = this;
		request('http://localhost:3000/artist/details?artistId=1',
			function handleResponse(err, res, body) {
			if (err) {
				throw new Error(err);
			}
			theWorld.err = err;
			theWorld.response = res;
			theWorld.body = body.trim();
			callback();
		});
	});

	this.Then(/^I should see the "([^"]*)" response$/, 
		function (filename, callback) {
		var responseFilePath = path.join(__dirname, '../responses',
										filename + '.json'),
			expectedResponse = fs.readFileSync(responseFilePath);
		var responseString = expectedResponse.toString().trim();

		console.log('actual: ' + this.body.length);
		console.log('expected: ' + responseString.length);
		assert.equal(this.body, responseString);
		callback();
	});

	this.Then(/^I should shutdown the server$/, function (callback) {
		this.proxyServer.on('exit', function() {
			callback();
		});
		this.proxyServer.kill();
	});
};

