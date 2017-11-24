let bcrypt        = require('bcrypt');
let logging       = require('../../services/logging/logging.service');
let config        = require('../../configuration/configuration');

//models
let SpacesToken = require('../../models/token');

//constants
const CLASS_NAME = 'token.controller';

export function getToken(req, res){
  let logger = logging.Logger(CLASS_NAME, getToken.name, config.log_level);

  SpacesToken.findById(req.params.id, function(err, tokenResult){
    if(!!err) {
      logger.ERROR(config.exceptions.GENERAL_EXCEPTION(err));
      res.sendStatus(500);
    }
    if(!tokenResult.isActive) {
      logger.INFO("Invalid token : " + req.params.id);
      res.status(403).send("Token invalid");
    }
    if(tokenResult.isSingleAccessExpired == true) {
      logger.INFO("Invalid expired : " + req.params.id);
      res.status(403).send("Token invalid");
    }
    else {
      SpacesToken.findByIdAndUpdate(req.params.id, {"isSingleAccessExpired": true}, function(err, tokenUpdateResult){
        if(err){
          logger.ERROR(err, config.exceptions.COLLECTION_FAILED("Token"));
        }
        let response = {
          accessToken : tokenResult.token,
          refreshToken : tokenResult.refreshToken
        };

        res.json(response);
      })
    }
  })
}
