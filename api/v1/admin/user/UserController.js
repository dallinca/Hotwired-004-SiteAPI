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
let { verifyPaginationParameters } = require(global.appRoot + '/utils/pagination.js');


// ==============================
// ===== Helping Functions -- Info Presence
// ==============================


// ==============================
// ===== Helping Functions -- Business Logic
// ==============================



// ==============================
// ===== Routes
// ==============================

router.get('/me', [verifyToken, cacheTokenOwnerInfo], function(req, res, next) {
  res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_User_DataProvided, res.locals.language), 'data': { 'user': res.locals.tokenOwnerInfo } });
});

router.get('/all', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P.P_Admin_User_ViewAll), verifyPaginationParameters], function(req, res, next) {
  User.find({}, { password: 0, _id: 0, __v: 0 }, { skip:parseInt(req.query.skip), limit:parseInt(req.query.limit), sort:'name' }, function(err, users) {
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