var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, lowercase: true },
  password: String
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');

/*
TODO
pending sent friends requests
pending recieved friends requests
friends list

*/