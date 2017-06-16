// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose models and pass it using module.exports
module.exports = mongoose.model('Application', new Schema({
  application: String,
  roles: [],
  register_redirect: String,
  reset_password_redirect: String,
  audience: String,
  secret: String,
  is_active: {type: Boolean, default: true},
  date_created: {type: Date, default: Date.now()},
  date_update: {type: Date, default: Date.now()}
})
);
