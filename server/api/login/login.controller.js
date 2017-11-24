let bcrypt        = require('bcrypt');
let logging       = require('../../services/logging/logging.service');
let config        = require('../../configuration/configuration');
let tokenService    = require('../../services/token/token.service');

//models
let PasswordReset = require('../../models/passwordReset');
let Application   = require('../../models/application');
let User          = require('../../models/user');

//constants
const CLASS_NAME = 'register.controller';

export function login(req, res){
  let logger = logging.Logger(CLASS_NAME, login.name, config.log_level);

  let email = "";
  let password = "";

  if(req.body.email && req.body.password){
    email = req.body.email;
    password = req.body.password;
  }
  else {
    logger.INFO("email/password missing");
    res.status(401).json({message:"email/password missing"});
  }
  User.findOne({email: email}, function(err, user){
    if( err || user == null ){
      logging.ERROR(err);
      res.status(401).json({message:"email/password incorrect"});
    }
    else {
      if(bcrypt.compareSync(password, user.password)) {
        let maxRole = {value: -1};
        let application = {};
        let userApplicationList = [];

        Application.find({"active":true}, function(err, applicationResult){

          applicationResult.forEach(function(applicationRecord){
            if(applicationRecord._id == user.applications[0].application_id){
              application = applicationRecord;
            }
            user.applications.forEach(function(userApplication){
              if(applicationRecord._id == userApplication.application_id){

                let userAppObject = {
                  name: applicationRecord.application,
                  application_id: applicationRecord._id,
                  roles:userApplication.roles
                };
                userApplicationList.push(userAppObject);
              }
            });
          });
          application.roles.forEach(function (role) {
            user.applications[0].roles.forEach(function (userRole) {
              if (userRole === role.role) {
                if (maxRole.value === undefined) {
                  maxRole = role;
                }
                else if (maxRole.value < role.value) {
                  maxRole = role;
                }
              }
            })
          });
          let payload = JSON.parse(JSON.stringify(user.applications[0]));
          payload.id = user.id;
          payload.accessible_applications = userApplicationList;

          tokenService.signAndSaveToken(application.secret, payload, application.audience, function(tokenResult){
            res.json({message: "ok", redirect: maxRole.redirect_url + '/' + tokenResult});
          })
        });
      } else {
        user.login_attempt++;
        user.save(function(err, updatedUser){
          res.status(401).json({message:"email/password incorrect"});
        });
      }
    }
  });

  // usually this would be a database call: something elsel

}
