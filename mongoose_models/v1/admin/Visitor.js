var mongoose = require('mongoose');  
var AdminVisitorSchema = new mongoose.Schema({
  email: { type: String, lowercase: true },
  emailVerificationCode: String,
  codeExpirationTime: Number,
  approvedForAccount: Boolean
});
mongoose.model('Admin_Visitor', AdminVisitorSchema);

module.exports = mongoose.model('Admin_Visitor');
