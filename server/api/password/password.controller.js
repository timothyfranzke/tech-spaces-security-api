let bcrypt        = require('bcrypt');
let logging       = require('../../services/logging/logging.service');
let config        = require('../../configuration/configuration');
let tokenService    = require('../../services/token/token.service');

//models
let PasswordReset = require('../../models/passwordReset');
let User = require('../../models/user');

//constants
const CLASS_NAME = 'password.controller';

export function resetPassword(req, res){
  let logger = logging.Logger(CLASS_NAME, resetPassword.name, config.log_level);

  PasswordReset.findOneAndUpdate({resetToken: req.body.token, isResetTokenExpired: false}, {isResetTokenExpired: true}, function(err, passwordResetResult){
    if (!!err) {
      logger.ERROR(config.exceptions.GENERAL_EXCEPTION(err));
      res.status(500).send("an error occurred");
    }
    if (passwordResetResult == null || passwordResetResult.userId == undefined){
      logger.INFO("invalid token passed : " + req.body.token);
      res.status(401).send("invalid token");
    }
    else {
      let salt = bcrypt.genSaltSync();
      let newPassword = bcrypt.hashSync(req.body.password, salt);
      User.findByIdAndUpdate(passwordResetResult.userId, {password:newPassword}, function(err, userResult){
        if (!!err)
        {
          logger.ERROR(config.exceptions.GENERAL_EXCEPTION(err));
          res.status(500).send("an error occurred");
        }
        else {
          res.sendStatus(200);
        }
      })
    }
  });
}
