const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_Server_Generic]: 'Error on the server.',
    [NAMES.ERROR_Email_AlreadyUsed]: 'Email already in use. Please use another email.',
    [NAMES.ERROR_Email_NotAUser]: 'Email provided is not currently registered as a user',
    [NAMES.ERROR_Email_NotProvided]: 'Request Body must contain an email field.',
    [NAMES.ERROR_User_Approval_NotProvided]: 'Request Body must contain the boolean approveUser field',
    [NAMES.ERROR_Name_DoesNotExit]: 'Provided user name does not exist',
    [NAMES.ERROR_UsersDoNotExit]: 'Can not return listed users',
    [NAMES.ERROR_QueryParam_Page_NotProvided]: 'Query Parameter \'page\' must be provided',
    [NAMES.ERROR_QueryParam_Limit_NotProvided]: 'Query Parameter \'limit\' must be provided',
    [NAMES.ERROR_QueryParam_Page_BadInput]: 'Query Parameter \'page\' must be a valid number no smaller than 1',
    [NAMES.ERROR_QueryParam_Limit_BadInput]: 'Query Parameter \'limit\' must be a valid number no smaller than 1 and no greater than 50',

    [NAMES.SUCCESS_User_Added]: 'User Added',
    [NAMES.SUCCESS_User_ApprovalUpdated]: 'The Approval status of the user has been updated ',
    [NAMES.SUCCESS_User_DataProvided]: 'User data provided'
};