const NAMES = require('./names.js');

module.exports = {
    [NAMES.ERROR_SERVERGENERIC]: 'Error on the server.',
    [NAMES.ERROR_NOEMAIL]: 'Send Registration Token Body must contain an email field.',
    [NAMES.ERROR_NOPASSWORD]: 'Register Body must contain a password field.',
    [NAMES.ERROR_NONAME]: 'Register Body must contain a name field.',
    [NAMES.ERROR_NOEMAILVERIFICATIONTOKEN]: 'Register Body must contain an email verification token.',
    [NAMES.ERROR_EMAILALREADYUSED]: 'Email already in use. Please use another email.',
    [NAMES.ERROR_NAMEALREADYUSED]: 'Name already in use. Please use another name'
};