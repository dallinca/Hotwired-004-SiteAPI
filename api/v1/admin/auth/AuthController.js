// Standard Utilities
const {
  config,
  logger,
  verifyToken, cacheTokenOwnerInfo, verifyPermission,
  errorCode, // nextErrorCode = '00040'; // Only used for keeping loose track of next ID assignment
  translations,
  router,
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);

// Prep Error Messages, Success Messages, Permission strings -- CONTROLLER SPECIFIC
const {
  ERROR_Example,
  SUCCESS_Example,

  ERROR_Email_AlreadyUsed,
  ERROR_Email_NotAUser,
  ERROR_Email_NotApprovedForAccount,
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
  ERROR_User_Approval_NotProvided,
  ERROR_User_Permissions,

  SUCCESS_EmailVerificationCode_Sent,
  SUCCESS_Login_Completed,
  SUCCESS_Registration_Completed,
  SUCCESS_Token_Authenticated,
  SUCCESS_User_Added,
  SUCCESS_User_ApprovalUpdated,
  SUCCESS_User_DataProvided,
  SUCCESS_User_PasswordReset
} = require(__filename + '.lang/names.js');
const P = {
  P_Admin_User_Add: 'P_Admin_User_Add',
  P_Admin_User_Approve: 'P_Admin_User_Approve',
  P_Admin_User_Email_VerificationCode_Send: 'P_Admin_User_Email_VerificationCode_Send',
  P_Admin_User_Email_VerificationCode_SendOwn: 'P_Admin_User_Email_VerificationCode_SendOwn',
  P_Admin_User_Email_VerificationCode_SendOther: 'P_Admin_User_Email_VerificationCode_SendOther',
  P_Admin_User_Remove: 'P_Admin_User_Remove'
}

// Prep models -- CONTROLLER SPECIFIC
var User = require(global.appRoot + '/mongoose_models/v1/admin/User');
var Visitor = require(global.appRoot + '/mongoose_models/v1/admin/Visitor');

// Prep Additional Libraries -- CONTROLLER SPECIFIC
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
let { sendEmail } = require(global.appRoot + "/utils/nodemailerTransport.js");

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

function verifyApproveUserInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00037'), message: translations(ERROR_Email_NotProvided, res.locals.language) });
  if (!req.body.approveUser) return res.status(400).send({ auth: false, token: null, code: errorCode('00038'), message: translations(ERROR_User_Approval_NotProvided, res.locals.language) });
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

function verifyApprovedForAccount(req, res, next) {
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err || !visitor) {
      logger.error(`500 - ${errorCode('00027')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00027'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (!visitor.approvedForAccount) {
      return res.status(403).send({ auth: false, token: null, token: null, code: errorCode('00028'), message: translations(ERROR_Email_NotApprovedForAccount, res.locals.language) }); 
    }
    next();
  });
}

function verifyEmailCode(req, res, next) {
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00010')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00010'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (!visitor) return res.status(401).send({ auth: false, token: null, code: errorCode('00020'), message: translations(ERROR_Registration_InvalidCredentials, res.locals.language) });
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

function verifyIsVisitor(req, res, next) {
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00033')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00033'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (!visitor) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00034'), message: translations(ERROR_Email_NotAUser, res.locals.language) });

    next();
  });
}

function verifyIsNotVisitor(req, res, next) {
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00035')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00035'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (visitor) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00036'), message: translations(ERROR_Email_AlreadyUsed, res.locals.language) });

    next();
  });
}

// ==============================
// ===== Routes
// ==============================

router.post('/sendEmailVerificationCode', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_User_Email_VerificationCode_Send), verifyEmailPresent, verifyIsVisitor], function(req, res) {
  // Generate code
  let NOW = Date.now();
  var emailVerificationCode = Math.floor(100000 + Math.random() * 900000);
  var codeExpirationTime = NOW + (config.auth.registration.codeValidTimeSeconds * 1000);
  var emailData = {
    from: config.email.from,
    to: req.body.email.toString(),
    subject: 'Hotwired Gaming email verification code - ADMIN Dashboard',
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
    }
  });  
});

router.post('/approveUser', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_User_Approve), verifyApproveUserInfoPresent, verifyUniqueEmail, verifyIsVisitor], function(req, res) {
  
  var emailData = {
    from: config.email.from,
    to: req.body.email.toString(),
    subject: 'Hotwired Gaming - ADMIN Dashboard - User Approved',
    text: 'Your email has been approved for an account on the admin dashboard of HotwiredGaming.com. Please contact your administrator to have them send an email verification code so you can complete your registration.',
    html: '<p>Your email has been approved for an account on the admin dashboard of <b>HotwiredGaming.com</b>. Please contact your administrator to have them send an email verification code so you can complete your registration.</p>'
  };
  
  Visitor.findOneAndUpdate({ email: req.body.email }, { 'approvedForAccount': req.body.approveUser }, { useFindAndModify: false }, function(err, visitor){
    if (err || !visitor) {
      logger.error(`500 - ${errorCode('00039')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00039'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      sendEmail(emailData);
      return res.status(200).send({ auth: false, token: null, message: translations(SUCCESS_User_ApprovalUpdated, res.locals.language) });
    }
  });
})

router.post('/addUser', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_User_Add), verifyEmailPresent, verifyUniqueEmail, verifyIsNotVisitor], function(req, res) {
  
  var emailData = {
    from: config.email.from,
    to: req.body.email.toString(),
    subject: 'Hotwired Gaming - ADMIN Dashboard - User Added',
    text: 'Your email has been added to the admin dashboard of HotwiredGaming.com. It still requires approval before you can register for an account.',
    html: '<p>Your email has been added to the admin dashboard of <b>HotwiredGaming.com</b>. It still requires approval before you can register for an account.</p>'
  };
  
  Visitor.create({
    email : req.body.email,
    'emailVerificationCode': '',
    'codeExpirationTime': '',
    'approvedForAccount': false
  }, function(err, visitor) {
    if (err || !visitor) {
      logger.error(`500 - ${errorCode('00032')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00032'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      sendEmail(emailData);
      return res.status(200).send({ auth: false, token: null, message: translations(SUCCESS_User_Added, res.locals.language) });
    }
  });
})

router.post('/register', [verifyRegisterInfoPresent, verifyUniqueEmail, verifyApprovedForAccount, verifyUniqueName, verifyEmailCode], function(req, res) {

  var emailData = {
    from: config.email.from,
    to: req.body.email.toString(),
    subject: 'Hotwired Gaming - ADMIN Dashboard - Account Registered',
    text: 'Your account has been registered as a user in the admin dashboard of HotwiredGaming.com.',
    html: '<p>Your account has been registered as a user in the admin dashboard of <b>HotwiredGaming.com</b>.</p>'
  };

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  
  User.create({
    name : req.body.name,
    email : req.body.email,
    password : hashedPassword,
    permissions : [P.P_Admin_User_Email_VerificationCode_SendOwn]
  },
  function (err, user) {
    if (err || !user) {
      logger.error(`500 - ${errorCode('00016')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00016'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (user) {
      // create a token
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: config.auth.jwt.tokenValidTimeSeconds
      });
      sendEmail(emailData);
      res.status(200).send({ auth: true, token: token, message: translations(SUCCESS_Registration_Completed, res.locals.language) });
    }
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

router.get('/me', [verifyToken, cacheTokenOwnerInfo], function(req, res, next) {
    res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_User_DataProvided, res.locals.language), 'user': res.locals.tokenOwnerInfo });
});

router.get('/checkToken', verifyToken, function(req, res, next) {
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