// config.js
module.exports = {
  'secret': 'supersecret',
  'registration': {
    'tokenValidTimeSeconds': 300
  },
  'email': {
    'from':'accounts@dabrhousegames.com',
    'user':'serviceAccountEmail',
    'serviceClient':'clientID',
    'privateKey':'privateKey',
    'scope':'https://mail.google.com/'
  }
};