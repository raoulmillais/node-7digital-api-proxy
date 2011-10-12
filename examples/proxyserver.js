var connect = require('connect'),
	api = require('7digital-api'),
	proxy = require('../index');

connect(
	connect.cookieParser(),
	connect.session({ secret: '7digital', cookie: { maxAge: 60000 }}),
	proxy()
).listen(3000);
