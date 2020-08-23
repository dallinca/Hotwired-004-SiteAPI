
var pathToRootFolder = '../../../../';

// Prep modelsi
var User = require(pathToRootFolder + 'mongoose_models/v1/site/User');

function loadUserInfo(req, res, next) {
  // Check token verification
  if (!res.locals.userId) {
    console.error('Cannot load user info without first verifying token');
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
  }

  // retrieve user informaton
  User.findById(res.locals.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send({ auth: false, token: null, message: 'There was a problem finding the user.' });
    if (!user) return res.status(404).send({ auth: false, token: null, message: 'No user found.' });
    
    res.locals.userInfo = user;
    next();
  });
}

module.exports = loadUserInfo;