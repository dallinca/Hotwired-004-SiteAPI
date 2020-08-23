var app = require('./app');
var configIpPort = require('./configIpPort');
var port = process.env.PORT || configIpPort.port;

var ipv4 = configIpPort.ipv4;

if (configIpPort.https == false) {

	var http = require('http');

	var httpServer = http.createServer(app);

	httpServer.listen(port, ipv4, function() {
	  console.log('Express server listening on port ' + port);
	});

} else {
	var fs = require('fs');
	var https = require('https');

	var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
	var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
	var credentials = {key: privateKey, cert: certificate};

	var httpsServer = https.createServer(credentials, app);

	httpsServer.listen(port, ipv4, function() {
	  console.log('Express server listening on port ' + port);
	});

}

/*var server = app.listen(port, ipv4, function() {
  console.log('Express server listening on port ' + port);
});*/


