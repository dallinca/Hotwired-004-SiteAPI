var mongoose = require('mongoose');  
var AdminUserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, lowercase: true },
  password: String,
  permissions: [String]
});
mongoose.model('Admin_User', AdminUserSchema);

module.exports = mongoose.model('Admin_User');
