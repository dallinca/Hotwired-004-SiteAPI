var mongoose = require('mongoose');  
var SiteUserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, lowercase: true },
  password: String
});
mongoose.model('Site_User', SiteUserSchema);

module.exports = mongoose.model('Site_User');
