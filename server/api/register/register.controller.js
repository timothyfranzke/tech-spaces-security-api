let objectID      = require('mongodb').ObjectId;
let logging       = require('../../services/logging/logging.service');
let config        = require('../../configuration/configuration');
let bcrypt        = require('bcrypt');
let emailService  = require('../../services/email/email.service');
let authService   = require('../../services/auth/auth.service');

//models
let PasswordReset = require('../../models/passwordReset');
let Application   = require('../../models/application');
let User          = require('../../models/user');

//constants
const CLASS_NAME = 'register.controller';

export function registerByApplication(req,res){
  //let db = require('../../services/db/db.service').getDb();
  let logger = logging.Logger(CLASS_NAME, registerByApplication.name, config.log_level);

  let salt = bcrypt.genSaltSync();
  let password = bcrypt.hashSync(req.body.password, salt);
  let user = new User();
  let applicationId = req.params.applicationID;

  user.email = req.body.email;
  user.password = password;
  user.applications = [];

  Application.findById(req.params.applicationID, function(err, applicationResult) {

    if (err) {
      logger.ERROR(err, config.exceptions.GENERAL_EXCEPTION(err));
      res.sendStatus(422);
    }
    else {
      let userApplication = {};

      if(!!req.body.application_data){
        logger.DEBUG("application_data from request : " + JSON.stringify(req.body.application_data));
        userApplication = req.body.application_data;

      }
      userApplication.roles = [];
      userApplication.roles.push(req.body.role);
      userApplication.application_id = applicationId.toString();
      userApplication.type = applicationResult.type;

      logger.DEBUG("application_data : " + JSON.stringify(userApplication));
      user.applications.push(userApplication);

      User.create(user, function(err, userResult){
        let passwordReset = new PasswordReset();
        passwordReset.resetToken = authService.generateRefreshToken();
        passwordReset.userId = userResult._id;

        passwordReset.save(function(err, passwordResetResult){
          let message = "<p>An account has been created for you. Click the link to create your password.</p><p><a href='" + applicationResult.reset_password_redirect + "/" + passwordReset.resetToken + "'>link</a></p>";
          let subject = "Tech Spaces Account Created";

          let registerEmailResponse = {
            "id": userResult._id
          };
          emailService.sendEmail(req.body.email, subject, message, function(err, mailResponse){
            if(err){
              logger.ERROR(config.exceptions.GENERAL_EXCEPTION(err));
            }
            res.send(registerEmailResponse);
          });
        });
      });
    }
  });
}

export function register(req,res){
  let salt = bcrypt.genSaltSync();
  let password = bcrypt.hashSync(req.body.password, salt);
  let user = new User();
  user.email = req.body.email;
  user.password = password;

  if(!!req.body.application_data)
  {
    user.application_data = req.body.application_data;
  }

  user.save(function(err, newUser){
    let payload = {id: newUser._id, permissions: ['admin', 'faculty']};
    let token = jwt.sign(payload, jwtOptions.secretOrKey, {
      expiresIn: 60 * 60 * 5
    });
    res.json({message: "ok", access_token: token, id: newUser._id});
  });
}
