// Standard Utilities
const {
  config,
  logger,
  verifyToken, cacheTokenOwnerInfo, verifyPermission,
  errorCode, // nextErrorCode = '00005'; // Only used for keeping loose track of next ID assignment
  translations,
  router,
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);

// Prep Error Messages, Success Messages, Permission strings -- CONTROLLER SPECIFIC
const {
  ERROR_Server_Generic,
  ERROR_Email_NotProvided,
  ERROR_Permissions_NotProvided,
  ERROR_Permissions_DoNotExist,

  SUCCESS_User_Permission_NamesProvided,
  SUCCESS_User_Permission_Updated
} = require(__filename + '.meta/languages/names.js');
const {
  P_Admin_User_Permissions_ViewAll,
  P_Admin_User_Permissions_Update,
} = require(__filename + '.meta/permissions/names.js');

// Prep models -- CONTROLLER SPECIFIC
var User = require(global.appRoot + '/mongoose_models/v1/admin/User');

// Prep Additional Libraries -- CONTROLLER SPECIFIC
const { getAllPermissions, verifyPermissionNamesExist } = require(global.appRoot + '/utils/permissions.js');

// ==============================
// ===== Helping Functions -- Info Presence
// ==============================
function verifyUpdatePermissionsInfoPresent(req, res, next) {
  if (!req.body.email) return res.status(400).send({ auth: false, token: null, code: errorCode('00001'), message: translations(ERROR_Email_NotProvided, res.locals.language) });
  if (!req.body.permissions) return res.status(400).send({ auth: false, token: null, code: errorCode('00002'), message: translations(ERROR_Permissions_NotProvided, res.locals.language) });
  next();
}

// ==============================
// ===== Helping Functions -- Business Logic
// ==============================



// ==============================
// ===== Routes
// ==============================
router.get('/all', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P_Admin_User_Permissions_ViewAll)], function(req, res, next) {
  return res.status(200).send({ auth: true, message: translations(SUCCESS_User_Permission_NamesProvided, res.locals.language), 'data': { 'items': getAllPermissions() } })
})

router.post('/update', [verifyToken, cacheTokenOwnerInfo, verifyPermission(P_Admin_User_Permissions_Update), verifyUpdatePermissionsInfoPresent], function(req, res, next) {
  if (!verifyPermissionNamesExist(req.body.permissions)) return res.status(400).send({ auth: true, code: errorCode('00003'), message: translations(ERROR_Permissions_DoNotExist) });
  
  User.findOneAndUpdate({ email: req.body.email }, { 'permissions': req.body.permissions }, { useFindAndModify: false }, function(err, user){
    if (err || !user) {
      logger.error(`500 - ${errorCode('00004')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, code: errorCode('00004'), message: translations(ERROR_Server_Generic, res.locals.language) });
    } else {
      return res.status(200).send({ auth: true, message: translations(SUCCESS_User_Permission_Updated, res.locals.language) })
    }
  });

})

module.exports = router;