var mongoose = require('mongoose');  
var SiteUserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, lowercase: true },
  password: String,
  canJoin: { type: Boolean, default: false },
  hostMax: { type: Number, default: 0 },
  guestMax: { type: Number, default: 0 },
  isGameDev: { type: Boolean, default: false },
  subscriptionPaid: {},
  subscriptionFree: {
    active: Boolean,
    startDate: Date,
    grantedBy: { type: String, lowercase: true }
  }
});
mongoose.model('Site_User', SiteUserSchema);

module.exports = mongoose.model('Site_User');
