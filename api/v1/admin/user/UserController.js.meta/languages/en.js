const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_Server_Generic]: 'Error on the server.',
    [NAMES.ERROR_Name_DoesNotExit]: 'Provided user name does not exist',
    [NAMES.ERROR_UsersDoNotExit]: 'Can not return listed users',

    [NAMES.SUCCESS_User_DataProvided]: 'User data provided'
};