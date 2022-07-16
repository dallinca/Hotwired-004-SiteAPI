const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_Server_Generic]: 'Error on the server.',
    [NAMES.ERROR_SiteUsersDoNotExit]: 'Can not return listed site users',
    [NAMES.ERROR_SiteUser_NewValueBoolean_NotProvided]: 'Request body must contain the property "newValue" of type "boolean"',
    [NAMES.ERROR_SiteUser_Email_NotProvided]: 'Request body must contain the property "email" of type "string"',
    [NAMES.ERROR_SiteUser_Email_DoesNotExist]: 'The provided email does not exist',

    [NAMES.SUCCESS_SiteUser_DataProvided]: 'Site User data provided',
    [NAMES.SUCCESS_SiteUser_IsGameDevPasswordReset]: 'SiteUser isGameDev status updated'
};