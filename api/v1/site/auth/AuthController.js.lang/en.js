const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_ServerGeneric]: 'Error on the server.',
    [NAMES.ERROR_NoEmail]: 'Send Registration Token Body must contain an email field.',
    [NAMES.ERROR_NoPassword]: 'Register Body must contain a password field.',
    [NAMES.ERROR_NoName]: 'Register Body must contain a name field.',
    [NAMES.ERROR_NoEmailVerificationToken]: 'Register Body must contain an email verification token.',
    [NAMES.ERROR_EmailAlreadyUsed]: 'Email already in use. Please use another email.',
    [NAMES.ERROR_NameAlreadyUsed]: 'Name already in use. Please use another name'
};