var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, lowercase: true },
  password: String
});
mongoose.model('Site_User', UserSchema);

module.exports = mongoose.model('Site_User');

/*
TODO
pending sent friends requests
pending recieved friends requests
friends list

*/