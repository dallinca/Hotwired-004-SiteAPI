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
  ERROR_Init_AlreadyCompleted,

  SUCCESS_Init_Completed
} = require(__filename + '.meta/languages/names.js');
const {
} = require(__filename + '.meta/permissions/names.js');

// Prep models -- CONTROLLER SPECIFIC
var User = require(global.appRoot + '/mongoose_models/v1/admin/User');
var Visitor = require(global.appRoot + '/mongoose_models/v1/admin/Visitor');

// Prep Additional Libraries -- CONTROLLER SPECIFIC
var bcrypt = require('bcryptjs');
let { sendEmail } = require(global.appRoot + '/utils/nodemailerTransport.js');

// ==============================
// ===== Helping Functions -- Info Presence
// ==============================


// ==============================
// ===== Helping Functions -- Business Logic
// ==============================

function verifyInitNeeded(req, res, next) {
User.findOne({ email: config.init.rootaccount.email }, function(err, user) {
  if (err) {
    logger.error(`500 - ${errorCode('00001')} - ${err}`);
    return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00001'), message: translations(ERROR_Server_Generic, res.locals.language) });
  }
  if (user) return res.status(409).send({ auth: false, token: null, token: null, code: errorCode('00002'), message: translations(ERROR_Init_AlreadyCompleted, res.locals.language) });

  next();
});
}

// ==============================
// ===== Routes
// ==============================

router.get('/', [verifyInitNeeded], function(req, res) {
  var rootEmail = config.init.rootaccount.email;
  var rootName = config.init.rootaccount.name;
  var rootPassword = bcrypt.hashSync(config.init.rootaccount.password, 8);

  // Generate code
  var emailData = {
    from: config.email.from,
    to: rootEmail.toString(),
    subject: 'Hotwired Gaming - ADMIN Dashboard - Account Setup completed',
    text: 'Root Account Setup Completed',
    html: '<p>Root Account Setup Completed</p>'
  };

  // Create/Update the Visitor
  Visitor.create({
    email : rootEmail,
    'emailVerificationCode': '',
    'codeExpirationTime': '',
    'approvedForAccount': true
  }, function(err, visitor) {
    if (err || !visitor) {
      logger.error(`500 - ${errorCode('00003')} - ${err}`);
      return res.status(500).send({ auth: false, token: null, token: null, code: errorCode('00003'), message: translations(ERROR_Server_Generic, res.locals.language) });
    }
    
    User.create({
      name: rootName,
      email: rootEmail,
      password: rootPassword,
      permissions: [
        'P_Admin_User_Email_VerificationCode_SendOwn',
        'P_Admin_User_Email_VerificationCode_SendOther',
        'P_Admin_User_ViewAll',
        'P_Admin_User_Permissions_ViewAll',
        'P_Admin_User_Permissions_Update',
        'P_Admin_Visitor_Add',
        'P_Admin_Visitor_ViewAll',
        'P_Admin_Visitor_Approve'
      ]
    },
    function (err, user) {
      if (err || !user) {
        logger.error(`500 - ${errorCode('00004')} - ${err}`);
        return res.status(500).send({ auth: false, token: null, code: errorCode('00004'), message: translations(ERROR_Server_Generic, res.locals.language) });
      }
      
      sendEmail(emailData);
      return res.status(200).send({ auth: true, token: null, message: translations(SUCCESS_Init_Completed, res.locals.language) });

    }); 
  });
})

module.exports = router;