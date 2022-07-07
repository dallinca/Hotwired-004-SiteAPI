// Standard Utilities
const {
  config,
  logger,
  errorCode, // nextErrorCode = '00005'; // Only used for keeping loose track of next ID assignment
  translations
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);

// Prep Error Messages, Success Messages, Permission strings 
const {
  ERROR_QueryParam_Page_NotProvided,
  ERROR_QueryParam_Limit_NotProvided,
  ERROR_QueryParam_Page_BadInput,
  ERROR_QueryParam_Limit_BadInput
} = require(__filename + '.meta/languages/names.js');

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

  // Ensure data is Integer for following middleware
  req.query.page = qPage;
  req.query.limit = qLimit;
  req.query.skip = (qPage - 1) * qLimit;
  next();
}

module.exports = { verifyPaginationParameters };