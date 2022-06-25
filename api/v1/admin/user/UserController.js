// Standard Utilities
const {
  config,
  logger,
  verifyToken, cacheTokenOwnerInfo, verifyPermission,
  errorCode, // nextErrorCode = '00009'; // Only used for keeping loose track of next ID assignment
  translations,
  router,
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);

// Prep Error Messages, Success Messages, Permission strings -- CONTROLLER SPECIFIC
const {
  ERROR_Server_Generic,
  ERROR_Name_DoesNotExit,
  ERROR_UsersDoNotExit,
  ERROR_QueryParam_Page_NotProvided,
  ERROR_QueryParam_Limit_NotProvided,
  ERROR_QueryParam_Page_BadInput,
  ERROR_QueryParam_Limit_BadInput,

  SUCCESS_User_DataProvided
} = require(__filename + '.lang/names.js');
const P = {
  P_Admin_User_Remove: 'P_Admin_User_Remove',
  P_Admin_User_ViewOne: 'P_Admin_User_ViewOne',
  P_Admin_User_ViewAll: 'P_Admin_User_ViewAll'
}

// Prep models -- CONTROLLER SPECIFIC
var User = require(global.appRoot + '/mongoose_models/v1/admin/User');

// Prep Additional Libraries -- CONTROLLER SPECIFIC


// ==============================
// ===== Helping Functions
// ==============================
function verifyPaginationParameters(req, res ,next) {
  if (!req.query.page) {
    return res.status(400).send({ auth: true, token: null, code: errorCode('00001'), message: translations(ERROR_QueryParam_Page_NotProvided, res.locals.language) });
  }
  if (!req.query.limit) {
    return res.status(400).send({ auth: true, token: null, code: errorCode('00002'), message: translations(ERROR_QueryParam_Limit_NotProvided, res.locals.language) });
  }
  let qPage = parseInt(req.query.page);
  let qLimit = parseInt(req.query.limit);
  if (isNaN(qPage) || qPage < 1) {
    return res.status(400).send({ auth: true, token: null, code: errorCode('00003'), message: translations(ERROR_QueryParam_Page_BadInput, res.locals.language) });
  }
  if (isNaN(qLimit)) {
    return res.status(400).send({ auth: true, token: null, code: errorCode('00004'), message: translations(ERROR_QueryParam_Limit_BadInput, res.locals.language) });
  }
  next();
}

// ==============================
// ===== Routes
// ==============================

router.get('/me', [verifyToken, cacheTokenOwnerInfo], function(req, res, next) {
  res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_User_DataProvided, res.locals.language), 'data': { 'user': res.locals.tokenOwnerInfo } });
});

router.get('/all', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_User_ViewAll), verifyPaginationParameters], function(req, res, next) {
  let qPage = parseInt(req.query.page);
  let qLimit = parseInt(req.query.limit);
  let qSkip = (qPage - 1) * qLimit;

  User.find({}, { password: 0, _id: 0, __v: 0 }, { skip:parseInt(qSkip), limit:parseInt(qLimit), sort:'name' }, function(err, users) {
    if (!users) {
      return res.status(500).send({ auth: false, token: null, code: errorCode('00005'), message: translations(ERROR_UsersDoNotExit, res.locals.language) });
    } else if (err) {
      logger.error(`500 - ${errorCode('00006')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00006'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_User_DataProvided, res.locals.language), 'data': { 'users': users } });
    }
  })
})

router.get('/_:userId', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_User_ViewOne)], function(req, res, next) {
  User.findOne({ name: req.params.userId }, { password: 0, _id: 0, __v: 0 }, function(err, user) {
    if (!user) {
      return res.status(500).send({ auth: false, token: null, code: errorCode('00007'), message: translations(ERROR_Name_DoesNotExit, res.locals.language) });
    } else if (err) {
      logger.error(`500 - ${errorCode('00008')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00008'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_User_DataProvided, res.locals.language), 'data': { 'user': user } });
    }
  })
});


module.exports = router;