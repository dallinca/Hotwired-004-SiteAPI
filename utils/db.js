var mongoose = require('mongoose');
const logger = require('./logger');
const config = require('../config/config');
mongoose.connect(config.database.address, function(error) {
  if (error) {
    logger.on('finish', function (info) {
      process.exit(1);
    });
    logger.error("Could not connect to database " + config.database.address);
    console.log("Could not connect to database %s", config.database.address);
    logger.end();
  }
});

var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));
/*db.on('error', function() {
  console.log("ASLDKFLAKSDJFLKAJSDF");
  console.log(stream);
  console.log("ASLDKFLAKSDJFLKAJSDF");
  logger.error("Unable to connect to database 'testing'");
  logger.error(stream);
});*/
db.once('open', function(stream) {
  logger.info("Connected to database " + config.database.address);
  console.log("Connected to database %s", config.database.address);
});