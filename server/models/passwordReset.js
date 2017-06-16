// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose models and pass it using module.exports
module.exports = mongoose.model('PasswordReset', new Schema({
  resetToken : String,
  issuedAt: { type: Date, default: Date.now() },
  expiresAt: { type: Date, default: Date.now() },
  isActive : { type: Boolean, default: true },
  isResetTokenExpired : {type: Boolean, default: false},
  userId: String
}));
