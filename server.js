var app = require('./app');
var configIpPort = require('./configIpPort');
var port = process.env.PORT || configIpPort.port;

var ipv4 = configIpPort.ipv4;

var server = app.listen(port, ipv4, function() {
  console.log('Express server listening on port ' + port);
});