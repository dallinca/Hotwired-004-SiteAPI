// config.js
module.exports = {
  'secret': 'supersecret',
  'auth': {
    'jwt': {
      'tokenValidTimeSeconds': 86400
    },
    'registration': {
      'codeValidTimeSeconds': 300
    },
  },
  'email': {
    'from':'accounts@dabrhousegames.com',
    'user':'serviceAccountEmail',
    'serviceClient':'clientID',
    'privateKey':'privateKey',
    'scope':'https://mail.google.com/'
  }
};