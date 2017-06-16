// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose models and pass it using module.exports
module.exports = mongoose.model('SpacesToken', new Schema({
  refreshToken : String,
  token : String,
  issuedAt: { type: Date, default: Date.now() },
  expiresAt: { type: Date, default: Date.now() },
  isActive : { type: Boolean, default: true },
  isSingleAccessExpired : {type: Boolean, default: false},
  isRefreshTokenExpired : {type: Boolean, default: false}
}));
