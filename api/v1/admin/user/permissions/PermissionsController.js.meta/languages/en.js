const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_Server_Generic]: 'Error on the server.',
    [NAMES.ERROR_Email_NotProvided]: 'Email not provided',
    [NAMES.ERROR_Permissions_NotProvided]: 'Permissions not provided',
    [NAMES.ERROR_Permissions_DoNotExist]: 'One of the provided Permissions does not exist',
    
    [NAMES.SUCCESS_User_Permission_NamesProvided]: 'List of possible user permissions provided.',
    [NAMES.SUCCESS_User_Permission_Updated]: 'Permissions updated'
};