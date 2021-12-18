// AuthController.js
var pathToRootFolder = '../../../../';
const logger = require(pathToRootFolder + 'utils/logger');
const config = require(pathToRootFolder + 'config/config');
const errorCode = require(pathToRootFolder + 'utils/errorCodes.js')(__filename); // nextErrorCode = '00027'; // Only used for keeping loose track of next ID assignment
var translations = require(pathToRootFolder + 'utils/translations.js')(__filename);
const {
  ERROR_Email_AlreadyUsed,
  ERROR_Email_NotAUser,
  ERROR_Email_NotProvided,
  ERROR_EmailVerificationCode_AlreadySent,
  ERROR_EmailVerificationCode_NotProvided,
  ERROR_EmailVerificationCode_Invalid,
  ERROR_EmailVerificationCode_Expired,
  ERROR_Login_InvalidCredentials,
  ERROR_Name_AlreadyUsed,
  ERROR_Name_NotProvided,
  ERROR_Password_NotProvided,
  ERROR_Registration_InvalidCredentials,
  ERROR_Server_Generic,

  SUCCESS_EmailVerificationCode_Sent,
  SUCCESS_Login_Completed,
  SUCCESS_Registration_Completed,
  SUCCESS_Token_Authenticated,
  SUCCESS_User_DataProvided,
  SUCCESS_User_PasswordReset
} = require(__filename + '.lang/names.js');

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
const nodemailer = require("nodemailer");

// Prep Email Transport
let transporter = nodemailer.createTransport({ // create reusable transporter object using the default SMTP transport
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    type: 'OAuth2',
    user: config.email.from,
    serviceClient: config.email.serviceClient,
    privateKey: config.email.privateKey,
    scope: config.email.scope
  },
});

// ==============================
// ===== Helping Functions
// ==============================

function verifyEmailPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00001'), message: translations(ERROR_Email_NotProvided, res.locals.language) });

  next();
}

function verifyRegisterInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00002'), message: translations(ERROR_Email_NotProvided, res.locals.language) });
  if (!req.body.password) return res.status(400).send({ auth: false, token: null, code: errorCode('00003'), message: translations(ERROR_Password_NotProvided, res.locals.language) });
  if (!req.body.name) return res.status(400).send({ auth: false, token: null, code: errorCode('00004'), message: translations(ERROR_Name_NotProvided, res.locals.language) });
  if (!req.body.emailVerificationCode) return res.status(400).send({ auth: false, token: null, code: errorCode('00005'), message: translations(ERROR_EmailVerificationCode_NotProvided, res.locals.language) });

  next();
}

function verifyChangePasswordInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00021'), message: translations(ERROR_Email_NotProvided, res.locals.language) });
  if (!req.body.password) return res.status(400).send({ auth: false, token: null, code: errorCode('00022'), message: translations(ERROR_Password_NotProvided, res.locals.language) });
  if (!req.body.emailVerificationCode) return res.status(400).send({ auth: false, token: null, code: errorCode('00023'), message: translations(ERROR_EmailVerificationCode_NotProvided, res.locals.language) });

  next();
}

function verifyUniqueEmail(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      logger.error(`500 - ${errorCode('00006')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00006'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (user) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00007'), message: translations(ERROR_Email_AlreadyUsed, res.locals.language) });

    next();
  });
}

function verifyUniqueName(req, res, next) {
  User.findOne({ name: req.body.name }, function(err, user) {
    if (err) {
      logger.error(`500 - ${errorCode('00008')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00008'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (user) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00009'), message: translations(ERROR_Name_AlreadyUsed, res.locals.language) });

    next();
  });
}

function verifyEmailCode(req, res, next) {
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00010')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00010'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (!visitor) return res.status(401).send({ auth: false, token: null, token: null, code: errorCode('00020'), message: translations(ERROR_Registration_InvalidCredentials, res.locals.language) });
    if (visitor.codeExpirationTime < Date.now()) return res.status(401).send({ auth: false, token: null, code: errorCode('00011'), message: translations(ERROR_EmailVerificationCode_Expired, res.locals.language) });
    if (visitor.emailVerificationCode != req.body.emailVerificationCode) return res.status(401).send({ auth: false, token: null, code: errorCode('00012'), message: translations(ERROR_EmailVerificationCode_Invalid, res.locals.language) });

    next();
  });
}

function verifyIsUser(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      logger.error(`500 - ${errorCode('00024')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00024'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (!user) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00025'), message: translations(ERROR_Email_NotAUser, res.locals.language) });

    next();
  });
}

async function sendEmail(emailData){
  let sentEmailInfo = await transporter.sendMail(emailData);
  logger.info("Email Verification code sent to %s: %s", emailData.to, sentEmailInfo.messageId);
  return;
}

// ==============================
// ===== Routes
// ==============================

router.post('/sendEmailVerificationCode', [verifyEmailPresent], function(req, res) {
  // Generate code
  let NOW = Date.now();
  var emailVerificationCode = Math.floor(100000 + Math.random() * 900000);
  var codeExpirationTime = NOW + (config.auth.registration.codeValidTimeSeconds * 1000);
  var emailData = {
    from: config.email.from,
    to: req.body.email.toString(),
    subject: 'Hotwired Gaming email verification code',
    text: 'Code is ' + emailVerificationCode,
    html: 'Code is <b>' + emailVerificationCode + '</b></p>'
  };

  // Find the entry if it exists
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00013')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00013'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (visitor && visitor.codeExpirationTime > NOW) {
      // Need to wait for code to expire before sending a new one
      return res.status(409).send({ auth: false, token: null, message: translations(ERROR_EmailVerificationCode_AlreadySent, res.locals.language) });
    } else if (visitor && visitor.codeExpirationTime <= NOW) {
      // Create a new code for an OLD visitor
      Visitor.findOneAndUpdate({ email: req.body.email }, { 'emailVerificationCode': emailVerificationCode, 'codeExpirationTime': codeExpirationTime }, { useFindAndModify: false }, function(err, visitor){
        if (err || !visitor) {
          logger.error(`500 - ${errorCode('00014')} - ${err}`);
          return res.status(500).send({ auth: false, token: null, code: errorCode('00014'), message: translations(ERROR_Server_Generic, res.locals.language) });
        } else {
          sendEmail(emailData);
          return res.status(200).send({ auth: false, token: null, message: translations(SUCCESS_EmailVerificationCode_Sent, res.locals.language) });
        }
      });
    } else {
      // Create a new code for a NEW visitor
      Visitor.create({
        email : req.body.email,
        'emailVerificationCode' : emailVerificationCode,
        'codeExpirationTime': codeExpirationTime
      }, function(err, visitor){
        if (err || !visitor) {
          logger.error(`500 - ${errorCode('00015')} - ${err}`);
          return res.status(500).send({ auth: false, token: null, code: errorCode('00015'), message: translations(ERROR_Server_Generic, res.locals.language) });
        } else {
          sendEmail(emailData);
          return res.status(200).send({ auth: false, token: null, message: translations(SUCCESS_EmailVerificationCode_Sent, res.locals.language) });
        }
      });
    }
  });  
});

router.post('/register', [verifyRegisterInfoPresent, verifyUniqueEmail, verifyUniqueName, verifyEmailCode], function(req, res) {
  
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  
  User.create({
    name : req.body.name,
    email : req.body.email,
    password : hashedPassword
  },
  function (err, user) {
    if (err) {
      logger.error(`500 - ${errorCode('00016')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00016'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: config.auth.jwt.tokenValidTimeSeconds
    });
    res.status(200).send({ auth: true, token: token, message: translations(SUCCESS_Registration_Completed, res.locals.language) });
  }); 
});

router.post('/resetPassword', [verifyChangePasswordInfoPresent, verifyIsUser, verifyEmailCode], function(req, res) {
  
  var emailData = {
    from: config.email.from,
    to: req.body.email.toString(),
    subject: 'Hotwired Gaming - Password was Reset',
    text: 'Please note that your Password was just reset for HotwiredGaming.com. If this was not done by you, we recommend you review your password and security for your email and HotwiredGaming.com.',
    html: '<p>Please note that your Password was just reset for <b>HotwiredGaming.com</b>. If this was not done by you, we recommend you review your password and security for your email and <b>HotwiredGaming.com</b>.</p>'
  };

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.findOneAndUpdate({ email: req.body.email }, { 'password': hashedPassword }, { useFindAndModify: false }, function(err, user){
    if (err || !user) {
      logger.error(`500 - ${errorCode('00026')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00026'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      sendEmail(emailData);
      return res.status(200).send({ auth: false, token: null, message: translations(SUCCESS_User_PasswordReset, res.locals.language) });
    }
  });
});

router.get('/me', [VerifyToken, LoadUserInfo], function(req, res, next) {
    res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_User_DataProvided, res.locals.language), 'user': res.locals.userInfo });
});

router.get('/checkToken', VerifyToken, function(req, res, next) {
  res.status(200).send({ auth: true, message: translations(SUCCESS_Token_Authenticated, res.locals.language) });
});

router.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      logger.error(`500 - ${errorCode('00017')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00017'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    // Don't tell client if user or password were individually correct, or wrong
    if (!user) return res.status(401).send({ auth: false, token: null, code: errorCode('00018'), message: translations(ERROR_Login_InvalidCredentials, res.locals.language) });
    
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    // Don't tell client if user or password were individually correct, or wrong
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null, code: errorCode('00019'), message: translations(ERROR_Login_InvalidCredentials, res.locals.language) });
    
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: config.auth.jwt.tokenValidTimeSeconds
    });
    
    res.status(200).send({ auth: true, token: token, message: translations(SUCCESS_Login_Completed, res.locals.language) });
  });
  
});

// AuthController.js
router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

// add this to the bottom of AuthController.js
module.exports = router;