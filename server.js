const { exit } = require('process');
const logger = require('./utils/logger');
var app = require('./app');
var configIpPort = require('./config/configIpPort');
var port = process.env.PORT || configIpPort.port;

if (!configIpPort.ipv4) {
	logger.error('No ipv4 address specified in ./config/configIpPort ');
	exit()
}

let ipv4Array = [];
if (typeof configIpPort.ipv4 === 'string') ipv4Array.push(configIpPort.ipv4)
else if (Array.isArray(configIpPort.ipv4)) ipv4Array = configIpPort.ipv4

if (!ipv4Array.length) {
	logger.error('No ipv4 address specified in ./config/configIpPort ');
	exit()
}

if (configIpPort.https == false) {

	var http = require('http');

	ipv4Array.forEach(function(ipv4, index) {
		http.createServer(app).listen(port, ipv4, function() {
			logger.info('Express server listening at ' + ipv4 + ':' + port);
		});
	});

} else {
	var fs = require('fs');
	var https = require('https');

	var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
	var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
	var credentials = {key: privateKey, cert: certificate};

	configIpPort.ipv4Array.forEach(function(ipv4, index) {
		https.createServer(credentials, app).listen(port, ipv4, function() {
			logger.info('Express server listening on port ' + port);
		});
	});

}

/*var server = app.listen(port, ipv4, function() {
  console.log('Express server listening on port ' + port);
});*/


