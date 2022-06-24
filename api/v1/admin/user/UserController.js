// Standard Utilities
const {
  config,
  logger,
  verifyToken, cacheTokenOwnerInfo, verifyPermission,
  errorCode, // nextErrorCode = '00012'; // Only used for keeping loose track of next ID assignment
  translations,
  router,
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);

// Prep Error Messages, Success Messages, Permission strings -- CONTROLLER SPECIFIC
const {
  ERROR_Server_Generic,
  ERROR_Email_AlreadyUsed,
  ERROR_Email_NotAUser,
  ERROR_Email_NotProvided,
  ERROR_User_Approval_NotProvided,

  SUCCESS_User_Added,
  SUCCESS_User_ApprovalUpdated,
  SUCCESS_User_DataProvided
} = require(__filename + '.lang/names.js');
const P = {
  P_Admin_User_Add: 'P_Admin_User_Add',
  P_Admin_User_Approve: 'P_Admin_User_Approve',
  P_Admin_User_Remove: 'P_Admin_User_Remove'
}

// Prep models -- CONTROLLER SPECIFIC
var User = require(global.appRoot + '/mongoose_models/v1/admin/User');
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

function verifyUniqueEmail(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) {
      logger.error(`500 - ${errorCode('00002')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00002'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (user) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00003'), message: translations(ERROR_Email_AlreadyUsed, res.locals.language) });

    next();
  });
}

function verifyIsVisitor(req, res, next) {
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00004')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00004'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (!visitor) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00005'), message: translations(ERROR_Email_NotAUser, res.locals.language) });

    next();
  });
}

function verifyIsNotVisitor(req, res, next) {
  Visitor.findOne({ email: req.body.email }, function(err, visitor) {
    if (err) {
      logger.error(`500 - ${errorCode('00006')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00006'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    if (visitor) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00007'), message: translations(ERROR_Email_AlreadyUsed, res.locals.language) });

    next();
  });
}

function verifyApproveUserInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00008'), message: translations(ERROR_Email_NotProvided, res.locals.language) });
  if (!req.body.approveUser) return res.status(400).send({ auth: false, token: null, code: errorCode('00009'), message: translations(ERROR_User_Approval_NotProvided, res.locals.language) });
  next();
}

// ==============================
// ===== Routes
// ==============================


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
      logger.error(`500 - ${errorCode('00010')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00010'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      sendEmail(emailData);
      return res.status(200).send({ auth: false, token: null, message: translations(SUCCESS_User_Added, res.locals.language) });
    }
  });
})

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
      logger.error(`500 - ${errorCode('00011')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00011'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      sendEmail(emailData);
      return res.status(200).send({ auth: false, token: null, message: translations(SUCCESS_User_ApprovalUpdated, res.locals.language) });
    }
  });
})

router.get('/me', [verifyToken, cacheTokenOwnerInfo], function(req, res, next) {
  res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_User_DataProvided, res.locals.language), 'user': res.locals.tokenOwnerInfo });
});


module.exports = router;