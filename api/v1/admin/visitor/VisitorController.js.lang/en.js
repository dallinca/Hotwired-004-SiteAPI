const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_Server_Generic]: 'Error on the server.',
    [NAMES.ERROR_Email_AlreadyUsed]: 'Email already in use. Please use another email.',
    [NAMES.ERROR_Email_NotAVisitor]: 'Email provided is not currently registered as a visitor',
    [NAMES.ERROR_Email_NotProvided]: 'Request Body must contain an email field.',
    [NAMES.ERROR_Visitor_Approval_NotProvided]: 'Request Body must contain the boolean approveUser field',
    [NAMES.ERROR_VisitorsDoNotExist]: 'Can not return listed users',
    
    [NAMES.SUCCESS_Visitor_Added]: 'User Added',
    [NAMES.SUCCESS_Visitor_ApprovalUpdated]: 'The Approval status of the user has been updated ',
    [NAMES.SUCCESS_Visitor_DataProvided]: 'User data provided'
};