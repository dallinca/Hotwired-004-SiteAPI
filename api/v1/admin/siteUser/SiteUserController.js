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
  ERROR_SiteUsersDoNotExit,
  ERROR_SiteUser_NewValueBoolean_NotProvided,
  ERROR_SiteUser_Email_NotProvided,
  ERROR_SiteUser_Email_DoesNotExist,

  SUCCESS_SiteUser_DataProvided,
  SUCCESS_SiteUser_IsGameDevPasswordReset
} = require(__filename + '.meta/languages/names.js');
const {
  P_Admin_SiteUser_ViewAll,
  P_Admin_SiteUser_PromoteAsGameDev
} = require(__filename + '.meta/permissions/names.js');

// Prep models -- CONTROLLER SPECIFIC
var SiteUser = require(global.appRoot + '/mongoose_models/v1/site/User');

// Prep Additional Libraries -- CONTROLLER SPECIFIC
let { verifyPaginationParameters } = require(global.appRoot + '/utils/pagination.js');


// ==============================
// ===== Helping Functions -- Info Presence
// ==============================

function verifyPromoteAsGameDevInfoPresent(req, res, next) {
  if (!req.body.email || !(typeof req.body.email === 'string')) return res.status(400).send({ auth: false, token: null, code: errorCode('00004'), message: translations(ERROR_SiteUser_Email_NotProvided, res.locals.language) });
  if (!req.body.newValue) return res.status(400).send({ auth: false, token: null, code: errorCode('00005'), message: translations(ERROR_SiteUser_NewValueBoolean_NotProvided, res.locals.language) });

  next();
}

// ==============================
// ===== Helping Functions -- Business Logic
// ==============================



// ==============================
// ===== Routes
// ==============================


router.get('/all', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P_Admin_SiteUser_ViewAll), verifyPaginationParameters], function(req, res, next) {
  SiteUser.countDocuments({}, function(err, count) {
    if (err) {
      logger.error(`500 - ${errorCode('00001')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00001'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    SiteUser.find({}, { password: 0, _id: 0, __v: 0 }, { skip:req.query.skip, limit:req.query.limit, sort:'name' }, function(err, siteUsers) {
      if (!siteUsers) {
        return res.status(500).send({ auth: false, token: null, code: errorCode('00002'), message: translations(ERROR_SiteUsersDoNotExit, res.locals.language) });
      } else if (err) {
        logger.error(`500 - ${errorCode('00003')} - ${err}`);
        return res.status(500).send({ auth: false, token: null, code: errorCode('00003'), message: translations(ERROR_Server_Generic, res.locals.language) });
      } else {
        return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_SiteUser_DataProvided, res.locals.language), 'data': { 'count': count, 'items': siteUsers } });
      }
    })
  });
})


router.post('/isGameDev', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P_Admin_SiteUser_PromoteAsGameDev), verifyPromoteAsGameDevInfoPresent], function(req, res, next) {
  SiteUser.findOneAndUpdate({ email: req.body.email }, { 'isGameDev': req.body.newValue }, { useFindAndModify: false }, function(err, siteUser) {
    if (err) {
      logger.error(`500 - ${errorCode('00006')} - ${err}`);
      return res.status(500).send({ auth: true, token: null, code: errorCode('00006'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else if (!siteUser) {
      return res.status(400).send({ auth: true, token: null, code: errorCode('00007'), message: translations(ERROR_SiteUser_Email_DoesNotExist, res.locals.language) });
    } else {
      return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_SiteUser_IsGameDevPasswordReset, res.locals.language) });
    }
  });
})

module.exports = router;