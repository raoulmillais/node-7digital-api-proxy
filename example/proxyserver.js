var connect = require('connect'),
	api = require('7digital-api'),
	proxy = require('../lib/apiproxy');

connect(
	proxy()
).listen(3000);
