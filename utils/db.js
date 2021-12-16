var mongoose = require('mongoose');
const logger = require('./logger');
mongoose.connect('mongodb://localhost:27017/testing', function(error) {
  if (error) {
    logger.on('finish', function (info) {
      process.exit(1);
    });
    logger.error("Could not connect to database 'testing'");
    console.log("Could not connect to database 'testing'");
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
  logger.info("Connected to database 'testing'");
  logger.info(stream);
});