// Standard Utilities
const {
    config,
    logger,
    verifyToken, cacheTokenOwnerInfo, verifyPermission,
    errorCode, // nextErrorCode = '00014'; // Only used for keeping loose track of next ID assignment
    translations,
    router,
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);
  
// Prep Error Messages, Success Messages, Permission strings -- CONTROLLER SPECIFIC
const {
  ERROR_Server_Generic,
  ERROR_Email_AlreadyUsed,
  ERROR_Email_NotAVisitor,
  ERROR_Email_NotProvided,
  ERROR_Visitor_Approval_NotProvided,
  ERROR_VisitorsDoNotExist,
  ERROR_QueryParam_Page_NotProvided,
  ERROR_QueryParam_Limit_NotProvided,
  ERROR_QueryParam_Page_BadInput,
  ERROR_QueryParam_Limit_BadInput,

  SUCCESS_Visitor_Added,
  SUCCESS_Visitor_ApprovalUpdated,
  SUCCESS_Visitor_DataProvided
} = require(__filename + '.lang/names.js');
const P = {
  P_Admin_Visitor_Add: 'P_Admin_Visitor_Add',
  P_Admin_Visitor_Remove: 'P_Admin_Visitor_Remove',
  P_Admin_Visitor_Approve: 'P_Admin_Visitor_Approve',
  P_Admin_Visitor_ViewOne: 'P_Admin_Visitor_ViewOne',
  P_Admin_Visitor_ViewAll: 'P_Admin_Visitor_ViewAll'
}

// Prep models -- CONTROLLER SPECIFIC
var User = require(global.appRoot + '/mongoose_models/v1/admin/User');
var Visitor = require(global.appRoot + '/mongoose_models/v1/admin/Visitor');

// Prep Additional Libraries -- CONTROLLER SPECIFIC
let { sendEmail } = require(global.appRoot + "/utils/nodemailerTransport.js");


// ==============================
// ===== Helping Functions -- Info Presence
// ==============================

function verifyEmailPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00001'), message: translations(ERROR_Email_NotProvided, res.locals.language) });

  next();
}

function verifyApproveVisitorInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00008'), message: translations(ERROR_Email_NotProvided, res.locals.language) });
  if (!req.body.approveVisitor) return res.status(400).send({ auth: false, token: null, code: errorCode('00009'), message: translations(ERROR_Visitor_Approval_NotProvided, res.locals.language) });
  next();
}


// ==============================
// ===== Helping Functions -- Business Logic
// ==============================

function verifyIsNotUser(req, res, next) {
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
    if (!visitor) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00005'), message: translations(ERROR_Email_NotAVisitor, res.locals.language) });

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

function verifyPaginationParameters(req, res ,next) {
  if (!req.query.page) {
    return res.status(400).send({ auth: true, token: null, code: errorCode('00014'), message: translations(ERROR_QueryParam_Page_NotProvided, res.locals.language) });
  }
  if (!req.query.limit) {
    return res.status(400).send({ auth: true, token: null, code: errorCode('00015'), message: translations(ERROR_QueryParam_Limit_NotProvided, res.locals.language) });
  }
  let qPage = parseInt(req.query.page);
  let qLimit = parseInt(req.query.limit);
  if (isNaN(qPage) || qPage < 1) {
    return res.status(400).send({ auth: true, token: null, code: errorCode('00016'), message: translations(ERROR_QueryParam_Page_BadInput, res.locals.language) });
  }
  if (isNaN(qLimit)) {
    return res.status(400).send({ auth: true, token: null, code: errorCode('00017'), message: translations(ERROR_QueryParam_Limit_BadInput, res.locals.language) });
  }
  next();
}


// ==============================
// ===== Routes
// ==============================
router.post('/add', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_Visitor_Add), verifyEmailPresent, verifyIsNotUser, verifyIsNotVisitor], function(req, res) {
  
  var emailData = {
    from: config.email.from,
    to: req.body.email.toString(),
    subject: 'Hotwired Gaming - ADMIN Dashboard - Visitor Added',
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
      return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_Visitor_Added, res.locals.language) });
    }
  });
})
  
router.post('/approve', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_Visitor_Approve), verifyApproveVisitorInfoPresent, verifyIsNotUser, verifyIsVisitor], function(req, res) {
    
  var emailData = {
    from: config.email.from,
    to: req.body.email.toString(),
    subject: 'Hotwired Gaming - ADMIN Dashboard - Visitor Approved for User account',
    text: 'Your email has been approved for an account on the admin dashboard of HotwiredGaming.com. Please contact your administrator to have them send an email verification code so you can complete your registration.',
    html: '<p>Your email has been approved for an account on the admin dashboard of <b>HotwiredGaming.com</b>. Please contact your administrator to have them send an email verification code so you can complete your registration.</p>'
  };
  
  Visitor.findOneAndUpdate({ email: req.body.email }, { 'approvedForAccount': req.body.approveVisitor }, { useFindAndModify: false }, function(err, visitor){
    if (err || !visitor) {
      logger.error(`500 - ${errorCode('00011')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00011'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      sendEmail(emailData);
      return res.status(200).send({ auth: false, token: null, message: translations(SUCCESS_Visitor_ApprovalUpdated, res.locals.language) });
    }
  });
})


router.get('/all', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_Visitor_ViewAll), verifyPaginationParameters], function(req, res, next) {
  let qPage = parseInt(req.query.page);
  let qLimit = parseInt(req.query.limit);
  let qSkip = (qPage - 1) * qLimit;

  Visitor.find({}, { emailVerificationCode: 0, _id: 0, __v: 0 }, { skip:parseInt(qSkip), limit:parseInt(qLimit), sort:'name' }, function(err, visitors) {
    if (!visitors) {
      return res.status(500).send({ auth: false, token: null, code: errorCode('00012'), message: translations(ERROR_VisitorsDoNotExist, res.locals.language) });
    } else if (err) {
      logger.error(`500 - ${errorCode('00013')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00013'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_Visitor_DataProvided, res.locals.language), 'data': { 'visitors': visitors } });
    }
  })
})


module.exports = router;