const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_Server_Generic]: 'Error on the server.',
    [NAMES.ERROR_Email_NotAUser]: 'Email provided is not currently registered as a user',
    [NAMES.ERROR_Email_NotProvided]: 'Request Body must contain an email field.',
    [NAMES.ERROR_EmailVerificationCode_AlreadySent]: 'Email Verification Code was already sent to this address recently. Please check the email messages thoroughly, or wait a few minutes before trying again.',
    
    [NAMES.SUCCESS_EmailVerificationCode_Sent]: 'Email Verification Code sent to the email specified',

};