const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_Email_AlreadyUsed]: 'Email already in use. Please use another email.',
    [NAMES.ERROR_Email_NotAUser]: 'Email provided is not currently registered as a user',
    [NAMES.ERROR_Email_NotProvided]: 'Request Body must contain an email field.',
    [NAMES.ERROR_EmailVerificationCode_AlreadySent]: 'Email Verification Code was already sent to this address recently. Please check the email messages thoroughly, or wait a few minutes before trying again.',
    [NAMES.ERROR_EmailVerificationCode_NotProvided]: 'Request Body must contain an email verification code.',
    [NAMES.ERROR_EmailVerificationCode_Invalid]: 'Email Verification Code is incorrect. Please check your email for the latest code provided.',
    [NAMES.ERROR_EmailVerificationCode_Expired]: 'Email Verification Code is Expired. Please ask for an a new Email Verification Code.',
    [NAMES.ERROR_Login_InvalidCredentials]: 'Login Credentials were not correct, please try again.',
    [NAMES.ERROR_Name_AlreadyUsed]: 'Name already in use. Please use another name.',
    [NAMES.ERROR_Name_NotProvided]: 'Request Body must contain a name field.',
    [NAMES.ERROR_Password_NotProvided]: 'Request Body must contain a password field.',
    [NAMES.ERROR_Registration_InvalidCredentials]: 'Registration Credentials are incorrect, please review your email and email verification code.',
    [NAMES.ERROR_Server_Generic]: 'Error on the server.',
    
    [NAMES.SUCCESS_EmailVerificationCode_Sent]: 'Email Verification Code sent to the email specified',
    [NAMES.SUCCESS_Login_Completed]: 'Login Successful',
    [NAMES.SUCCESS_Registration_Completed]: 'Registration Successful',
    [NAMES.SUCCESS_Token_Authenticated]: 'Token Authenticated',
    [NAMES.SUCCESS_User_DataProvided]: 'User data provided',
    [NAMES.SUCCESS_User_PasswordReset]: 'User password reset successfully'
};