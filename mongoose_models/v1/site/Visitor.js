var mongoose = require('mongoose');  
var SiteVisitorSchema = new mongoose.Schema({
  email: { type: String, lowercase: true },
  emailVerificationCode: String,
  codeExpirationTime: Number
});
mongoose.model('Site_Visitor', SiteVisitorSchema);

module.exports = mongoose.model('Site_Visitor');
