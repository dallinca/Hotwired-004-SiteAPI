// config.js
module.exports = {
  'secret': 'supersecret',
  'init': {
    'rootaccount': {
      'email': 'rootuseremail@gmail.com',
      'name': 'rootuser',
      'password': 'changeme'
    }
  },
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
  },
  'database': {
    'address': 'mongodb://localhost:27017/hw'
  },
  'ipv4': ['127.0.0.1', '192.168.0.12'],
  'port': 3000
};