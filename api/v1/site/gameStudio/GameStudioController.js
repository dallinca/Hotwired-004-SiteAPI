// Standard Utilities
const {
  config,
  logger,
  verifyToken, cacheTokenOwnerInfo, verifyPermission,
  errorCode, // nextErrorCode = '00010'; // Only used for keeping loose track of next ID assignment
  translations,
  router,
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);

// Prep Error Messages, Success Messages, Permission strings -- CONTROLLER SPECIFIC
const {
  ERROR_Server_Generic,
  ERROR_Name_DoesNotExit,
  ERROR_UsersDoNotExit,

  SUCCESS_User_DataProvided
} = require(__filename + '.meta/languages/names.js');
const {
  P_Admin_User_Remove,
  P_Admin_User_ViewOne,
  P_Admin_User_ViewAll
} = require(__filename + '.meta/permissions/names.js');

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




module.exports = router;