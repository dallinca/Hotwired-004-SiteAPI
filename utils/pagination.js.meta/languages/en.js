const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_QueryParam_Page_NotProvided]: 'Query Parameter \'page\' must be provided',
    [NAMES.ERROR_QueryParam_Limit_NotProvided]: 'Query Parameter \'limit\' must be provided',
    [NAMES.ERROR_QueryParam_Page_BadInput]: 'Query Parameter \'page\' must be a valid number no smaller than 1',
    [NAMES.ERROR_QueryParam_Limit_BadInput]: 'Query Parameter \'limit\' must be a valid number no smaller than 1 and no greater than 50',
};