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
var Visitor = require(pathToRootFolder + 'mongoose_models/v1/site/Visitor');

// Prep Additional Libraries
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

// Prep local configurations
var config = require(pathToRootFolder + 'config');

// Prep email module
const nodemailer = require("nodemailer");
const {google} = require("googleapis");
const oauth2Client = new google.auth.OAuth2(
  config.emailClientID,
  config.emailClientSecret,
  "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({ refresh_token: config.refreshToken });
const newAccessToken = oauth2Client.getAccessToken();
console.log("NEW ACCESS TOKEN: " + newAccessToken);

let transporter = nodemailer.createTransport({ // create reusable transporter object using the default SMTP transport
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    type: 'OAuth2',
    //user: config.emailAddress,
    clientID: config.emailClientID,
    clientSecret: config.emailClientSecret,
    refreshToken: config.refreshToken,
    accessToken: newAccessToken
  },
});

// ==============================
// ===== Helping Functions
// ==============================

function verifySendRegistrationTokenInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(404).send({ auth: false, token: null, message: 'Send Registration Token Body must contain an email field.' });

  next();
}

function verifyRegisterInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(404).send({ auth: false, token: null, message: 'Register Body must contain an email field.' });
  if (!req.body.password) return res.status(404).send({ auth: false, token: null, message: 'Register Body must contain a password field.' });
  if (!req.body.name) return res.status(404).send({ auth: false, token: null, message: 'Register Body must contain a name field.' });
  if (!req.body.emailVerificationToken) return res.status(404).send({ auth: false, token: null, message: 'Register Body must contain an email verification token.' });

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

async function sendTestEmail(registrationToken, visitorEmail){
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'dabr@dabrhousegames.com', // sender address
    to: visitorEmail, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "First Test Email. Code is " + registrationToken, // plain text body
    html: "<p>First Test Email. Code is <b>" + registrationToken + "</b></p>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

// ==============================
// ===== Routes
// ==============================

router.post('/sendRegistrationToken', [verifySendRegistrationTokenInfoPresent, verifyUniqueEmail], function(req, res) {
  
  // Generate token
  var registrationToken = Math.floor(100000 + Math.random() * 900000);

  // Ensure an entry exists for the email along with a registrationToken
  Visitor.findOneAndUpdate({ email: req.body.email }, { 'registrationToken': registrationToken }, { useFindAndModify: false }, function(err, visitor){
    if (err) return res.status(500).send({ auth: false, token: null, message: 'Error on the server. Unable to send Registration Token.' });
    if (!visitor) {
      Visitor.create({
        email : req.body.email,
        'registrationToken' : registrationToken
      }, function(err, visitor){
        if (err || !visitor) return res.status(500).send({ auth: false, token: null, message: 'Error on the server. Unable to send Registration Token.' });
      });
    }
  });

  // Send the registrationToken
  console.log('Ready to send Token via email, but not yet implemented');
  sendTestEmail(registrationToken, req.body.email);

  // Success
  res.status(200).send({ auth: false, token: null, message: 'Registration Token sent to the email specified' });
});

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