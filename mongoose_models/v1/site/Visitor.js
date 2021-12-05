var mongoose = require('mongoose');  
var VisitorSchema = new mongoose.Schema({
  email: { type: String, lowercase: true },
  registrationToken: String
});
mongoose.model('Site_Visitor', VisitorSchema);

module.exports = mongoose.model('Site_Visitor');
