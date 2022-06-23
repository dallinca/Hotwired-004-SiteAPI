// Set Root Folder path
var pathToRootFolder = '../';

var jwt = require('jsonwebtoken');
var config = require(pathToRootFolder + 'config/config');
const logger = require(pathToRootFolder + 'utils/logger');

// Prep models 
var adminUser = require(pathToRootFolder + 'mongoose_models/v1/admin/User');
//var Visitor = require(pathToRootFolder + 'mongoose_models/v1/admin/Visitor');

var siteUser = require(pathToRootFolder + 'mongoose_models/v1/site/User');
//var Visitor = require(pathToRootFolder + 'mongoose_models/v1/site/Visitor');

function getPortal(req) {
  return req.originalUrl.split("/")[3]; 
}

function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
  if (!token) return res.status(403).send({ auth: false, token: null, message: 'No token provided.' });
    
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err) return res.status(500).send({ auth: false, token: null, message: 'Failed to authenticate token.' });
    // if everything good, save to request for use in other routes
    res.locals.userId = decoded.id;
    next();
  });
}

function cacheTokenOwnerInfo(req, res, next) {
  var portal = getPortal(req);
  var User = {};
  if (portal == 'admin') {
    User = adminUser;
  } else if (portal == 'site') {
    User = siteUser;
  } else {
    return res.status(500).send({ auth: false, token: null, message: 'Unrecognized portal.' });
  }

  User.findById(res.locals.userId, { password: 0 }, function (err, user) {
    if (!user) console.log("not user");
    if (err) console.log(err) 
    if (err || !user) {
      logger.error(`500 - ${err}`);
      //logger.error(`500 - ${errorCode('00029')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, message: 'Failed to cache token information.' });
    }
    
    res.locals.tokenOwnerInfo = user;
    next();
  });
}

/*function verifyPermission(permission) {
  return verifyPermission[permission] || (verifyPermission[permission] = function(req, res, next) {
    if (!res.locals.tokenOwnerInfo.permissions.includes(permission)) return res.status(403).send({ auth: false, token: null, token: null, message: 'Insufficient permissions' }); 
    next();
  })
}*/

function verifyPermission(permission) {
  return function(req, res, next) {
    if (!res.locals.tokenOwnerInfo.permissions.includes(permission)) return res.status(403).send({ auth: false, token: null, token: null, message: 'Insufficient permissions' }); 
    next();
  }
}

module.exports = { verifyToken, cacheTokenOwnerInfo, verifyPermission };