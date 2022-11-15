const { exit } = require('process');
const logger = require('./utils/logger');
var app = require('./app');
var config = require('./config/config');
var port = process.env.PORT || config.port;

if (!config.ipv4) {
	logger.error('No ipv4 address specified in ./config/config ');
	exit()
}

let ipv4Array = [];
if (typeof config.ipv4 === 'string') ipv4Array.push(config.ipv4)
else if (Array.isArray(config.ipv4)) ipv4Array = config.ipv4

if (!ipv4Array.length) {
	logger.error('No ipv4 address specified in ./config/config ');
	exit()
}

var http = require('http');

ipv4Array.forEach(function(ipv4, index) {
	http.createServer(app).listen(port, ipv4, function() {
		logger.info('Server listening at ' + ipv4 + ':' + port);
		console.log('Server listening at ' + ipv4 + ':' + port);
	});
});


