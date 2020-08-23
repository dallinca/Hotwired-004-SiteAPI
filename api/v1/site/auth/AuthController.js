// AuthController.js
var pathToRootFolder = '../../../../';

// Prep router
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Prep Auth
var VerifyToken = require('./VerifyToken');
var LoadUserInfo = require('./LoadUserInfo');

// Prep models
var User = require(pathToRootFolder + 'mongoose_models/v1/site/User');

// Prep Additional Libraries
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

// Prep local configurations
var config = require(pathToRootFolder + 'config');

// ==============================
// ===== Helping Functions
// ==============================

function verifyRegisterInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(404).send({ auth: false, token: null, message: 'Register Body must contain an email field.' });
  if (!req.body.password) return res.status(404).send({ auth: false, token: null, message: 'Register Body must contain a password field.' });
  if (!req.body.name) return res.status(404).send({ auth: false, token: null, message: 'Register Body must contain a name field.' });

  next();
}

function verifyUniqueEmail(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) return res.status(500).send({ auth: false, token: null, message: 'Error on the server.' });
    if (user) return res.status(404).send({ auth: false, token: null, message: 'Email already registered. Please use another email.' });

    next();
  });
}

function verifyUniqueName(req, res, next) {
  User.findOne({ name: req.body.name }, function(err, user) {
    if (err) return res.status(500).send({ auth: false, token: null, message: 'Error on the server.' });
    if (user) return res.status(404).send({ auth: false, token: null, message: 'Name already in use. Please use another name' });

    next();
  });
}

// ==============================
// ===== Routes
// ==============================

router.post('/register', [verifyRegisterInfoPresent, verifyUniqueEmail, verifyUniqueName], function(req, res) {
  
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  
  User.create({
    name : req.body.name,
    email : req.body.email,
    password : hashedPassword
  },
  function (err, user) {
    if (err) return res.status(500).send({ auth: false, token: null, message: 'There was a problem registering the user.' });
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    res.status(200).send({ auth: true, token: token, message: 'Registration successful' });
  }); 
});

router.get('/me', [VerifyToken, LoadUserInfo], function(req, res, next) {
    res.status(200).send({ auth: true, token: null, 'user': res.locals.userInfo });
});

router.get('/checkToken', VerifyToken, function(req, res, next) {
  res.status(200).send({ auth: true, message: 'Token authenticated' });
});

router.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send({ auth: false, token: null, message: 'Error on the server.' });
    if (!user) return res.status(404).send({ auth: false, token: null, message: 'No user found.' });
    
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null, message: 'Invalid Password.' });
    
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });
    
    res.status(200).send({ auth: true, token: token, message: 'Login Successful'  });
  });
  
});

// AuthController.js
router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

// add this to the bottom of AuthController.js
module.exports = router;