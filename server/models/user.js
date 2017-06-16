// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose models and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
  email: String,
  password: String,
  roles: [],
  application_data: {},
  first_login: {type: Boolean, default:true},
  reset_password: Boolean,
  is_locked: {type: Boolean, default: false},
  last_login: Date,
  login_attempt: Number,
  date_created: {type: Date, default: Date.now()},
  date_update: {type: Date, default: Date.now()}
}));
