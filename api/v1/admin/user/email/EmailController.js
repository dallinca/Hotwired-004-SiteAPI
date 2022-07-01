// Standard Utilities
const {
  config,
  logger,
  verifyToken, cacheTokenOwnerInfo, verifyPermission,
  errorCode, // nextErrorCode = '00008'; // Only used for keeping loose track of next ID assignment
  translations,
  router,
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);

// Prep Error Messages, Success Messages, Permission strings -- CONTROLLER SPECIFIC
const {
  ERROR_Server_Generic,
  ERROR_Email_NotAUser,
  ERROR_Email_NotProvided,
  ERROR_EmailVerificationCode_AlreadySent,

  SUCCESS_EmailVerificationCode_Sent
} = require(__filename + '.lang/names.js');
const P = {
  P_Admin_User_Email_VerificationCode_SendOwn: 'P_Admin_User_Email_VerificationCode_SendOwn',
  P_Admin_User_Email_VerificationCode_SendOther: 'P_Admin_User_Email_VerificationCode_SendOther'
}

// Prep models -- CONTROLLER SPECIFIC
var Visitor = require(global.appRoot + '/mongoose_models/v1/admin/Visitor');

// Prep Additional Libraries -- CONTROLLER SPECIFIC
let { sendEmail } = require(global.appRoot + "/utils/nodemailerTransport.js");


// ==============================
// ===== Helping Functions
// ==============================

function verifyEmailPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00001'), message: translations(ERROR_Email_NotProvided, res.locals.language) });

  next();
}

function verifyIsVisitor(req, res, next) {
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00002')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00002'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (!visitor) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00003'), message: translations(ERROR_Email_NotAUser, res.locals.language) });

    next();
  });
}

// ==============================
// ===== Routes
// ==============================
router.post('/sendOwnEmailVerificationCode', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_User_Email_VerificationCode_SendOwn)], function(req, res) {
  var toEmail = res.locals.tokenOwnerInfo.email;
  
  // Generate code
  let NOW = Date.now();
  var emailVerificationCode = Math.floor(100000 + Math.random() * 900000);
  var codeExpirationTime = NOW + (config.auth.registration.codeValidTimeSeconds * 1000);
  var emailData = {
    from: config.email.from,
    to: toEmail.toString(),
    subject: 'Hotwired Gaming email verification code - ADMIN Dashboard',
    text: 'Code is ' + emailVerificationCode,
    html: 'Code is <b>' + emailVerificationCode + '</b></p>'
  };

  // Find the entry if it exists
  Visitor.findOne({ email: toEmail }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00004')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00004'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (visitor && visitor.codeExpirationTime > NOW) {
      // Need to wait for code to expire before sending a new one
      return res.status(409).send({ auth: false, token: null, message: translations(ERROR_EmailVerificationCode_AlreadySent, res.locals.language) });
    } else if (visitor && visitor.codeExpirationTime <= NOW) {
      // Create a new code for an OLD visitor
      Visitor.findOneAndUpdate({ email: toEmail }, { 'emailVerificationCode': emailVerificationCode, 'codeExpirationTime': codeExpirationTime }, { useFindAndModify: false }, function(err, visitor){
        if (err || !visitor) {
          logger.error(`500 - ${errorCode('00005')} - ${err}`);
          return res.status(500).send({ auth: false, token: null, code: errorCode('00005'), message: translations(ERROR_Server_Generic, res.locals.language) });
        } else {
          sendEmail(emailData);
          return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_EmailVerificationCode_Sent, res.locals.language) });
        }
      });
    }
  });  
});

router.post('/sendOtherEmailVerificationCode', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_User_Email_VerificationCode_SendOther), verifyEmailPresent, verifyIsVisitor], function(req, res) {
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
      logger.error(`500 - ${errorCode('00006')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00006'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (visitor && visitor.codeExpirationTime > NOW) {
      // Need to wait for code to expire before sending a new one
      return res.status(409).send({ auth: false, token: null, message: translations(ERROR_EmailVerificationCode_AlreadySent, res.locals.language) });
    } else if (visitor && visitor.codeExpirationTime <= NOW) {
      // Create a new code for an OLD visitor
      Visitor.findOneAndUpdate({ email: req.body.email }, { 'emailVerificationCode': emailVerificationCode, 'codeExpirationTime': codeExpirationTime }, { useFindAndModify: false }, function(err, visitor){
        if (err || !visitor) {
          logger.error(`500 - ${errorCode('00007')} - ${err}`);
          return res.status(500).send({ auth: false, token: null, code: errorCode('00007'), message: translations(ERROR_Server_Generic, res.locals.language) });
        } else {
          sendEmail(emailData);
          return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_EmailVerificationCode_Sent, res.locals.language) });
        }
      });
    }
  });  
});

module.exports = router;