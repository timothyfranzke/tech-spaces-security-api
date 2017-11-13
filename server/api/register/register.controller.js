let objectID = require('mongodb').ObjectId;
let logging = require('../../services/logging/logging.service');
let config = require('../../configuration/configuration');
let className = 'entity.controller';
let bcrypt      = require('bcrypt');
let application = require('../../../server/models/application');
let emailService = require('../../services/email/email.service');
let authService = require('../../services/auth/auth.service');
let PasswordReset = require('../../models/passwordReset');

export function registerEmail(req,res){
  let db = require('../../services/db/db.service').getDb();
  let logger = logging.Logger(className, get.name, config.log_level);

  let salt = bcrypt.genSaltSync();
  let password = bcrypt.hashSync(req.body.password, salt);
  let user = new User();

  user.email = req.body.email;
  user.password = password;
  user.applications = [];

  application.findById(req.user.application_id, function(err, applicationResult) {
    if (applicationResult == null) {
      res.status(403);
    }

    let validator = expressJwt({
      secret: applicationResult.secret
    });

    validator(req,res,function(err, response){
      if (err) {
        logger.ERROR(err, config.exceptions.GENERAL_EXCEPTION(err));
        res.sendStatus(422);
      }
      else {
        let application = {
          application_id: req.body.application_id,
          roles:[]
        };
        let application_data = {};

        application.roles.push(req.body.role);
        user.applications.push(application);

        if(req.user.application_data){
          application_data = Object.assign(application, req.user.application_data);
        }

        User.create(user, function(err, userResult){
          let passwordReset = new PasswordReset();
          passwordReset.resetToken = authService.generateRefreshToken();
          passwordReset.userId = userResult._id;

          passwordReset.save(function(err, passwordResetResult){
            let mail = "<p>An account has been created for you. Click the link to create your password.</p><p><a href='" + applicationResult.reset_password_redirect + "/" + passwordReset.resetToken + "'>link</a></p>";
            let message = {
              to: req.body.email,
              subject: "Reset your password",
              body: mail
            };
            let registerEmailResponse = {
              "id": userResult._id
            };
            emailService.sendEmail(message, function(err, mailResponse){
              if(err){
                logger.ERROR(config.exceptions.GENERAL_EXCEPTION(err));
              }

              res.send(registerEmailResponse);
            });
          });
        });
      }
    });
  });
}

export function register(req,res){
  let db = require('../../services/db/db.service').getDb();
  let logger = logging.Logger(className, get.name, config.log_level);

  let entity_id = objectID(req.params.id);
  let entityQuery = {_id : entity_id};
  logger.DEBUG(config.information.COLLECTION_QUERY("entity", entityQuery));

  try{
    db.collection('entity').find( entityQuery).toArray(function(err, entityResult){
      if (err) {
        logger.ERROR(err, config.exceptions.COLLECTION_FAILED("entity"));
        res.sendStatus(422);
      }
      else {
        {
          logger.DEBUG(config.information.COLLECTION_SUCCEEDED_WITH_RESULT("entity", entityResult));

          let entityResponse = {
            data: entityResult
          };

          res.json(entityResponse);
        }
      }
    });
  }
  catch(err){
    logger.ERROR(err, config.exceptions.COLLECTION_FAILED("entity"));

    res.sendStatus(422);
  }
}
