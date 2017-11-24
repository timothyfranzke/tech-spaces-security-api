let tokenService    = require('../../services/token/token.service');
let objUtils        = require('../../utils/object.utils');
let logging         = require('../../services/logging/logging.service');
let config = require('../../configuration/configuration');

//models
let Application     = require('../../models/application');
let User            = require('../../models/user');

//constants
let CLASS_NAME       = "application.controller";

export function redirect(req, res){
  let logger = logging.Logger(CLASS_NAME, redirect.name, config.log_level);

  let claims = tokenService.getClaims(req.headers.authorization);

  if(objUtils.isEmpty(claims)){
    return res.sendStatus(403);
  }

  logger.INFO("search for user with claims : " + JSON.stringify(claims));
  let userid = claims.id;
  User.findById(userid, function(err, userResult){
      if( err || userResult == null ){
        logger.ERROR(err, "error while search for user : " + userid);
        res.status(401).json({message:"email/password incorrect"});
      }
      else {
        let maxRole = {value: -1};
        let redirectApplication = {};
        let userApplicationList = [];

        Application.find({"active":true}, function(err, applicationResult){
          applicationResult.forEach(function(applicationRecord){
            if(applicationRecord._id == req.params.applicationId){
              redirectApplication = applicationRecord;
            }
          });

          let redirectApplicationIndex = userResult.applications.findIndex(i => i.application_id === redirectApplication._id.toString());
          let requestingApplicationIndex = userResult.applications.findIndex(i => i.application_id === claims.application_id);

          redirectApplication.roles.forEach(function (role) {
            userResult.applications[redirectApplicationIndex].roles.forEach(function (userRole) {
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
          let payload = {};
          if(redirectApplication.type == 'plugin'){
            payload = JSON.parse(JSON.stringify(userResult.applications[requestingApplicationIndex]));
            payload.application_id = redirectApplication._id;
          }
          else {
            payload = JSON.parse(JSON.stringify(userResult.applications[redirectApplicationIndex]))
          }
          payload.id = userResult.id;
          payload.accessible_applications = userApplicationList;

          tokenService.signAndSaveToken(redirectApplication.secret, payload, redirectApplication.audience, function(tokenResult){
            res.json({message: "ok", redirect: maxRole.redirect_url + '/' + tokenResult});
          })
        });
      }
    });
}
