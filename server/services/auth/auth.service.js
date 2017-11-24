let expressJwt  = require('express-jwt');
let compose     = require('composable-middleware');
let logging     = require('../logging/logging.service');
let config      = require('../../configuration/configuration');
let base64      = require('base-64');
let className   = "auth.service";

export function isAuthenticated(req, res){
  let methodName   = "isAuthenticated";
  return compose()
  // Validate jwt
    .use(function(req, res, next) {
      let applicationfound = false;
      logging.INFO(className, isAuthenticated.name, req.headers);
      if(req.headers.authorization === undefined){
        return res.sendStatus(403);
      }
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        logging.INFO(className, methodName, "Token : " + req.query.access_token);
        req.headers.authorization = `Bearer ${req.query.access_token}`;
      }
      // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
      if(req.query && typeof req.headers.authorization === 'undefined' && typeof req.cookies.token !== 'undefined') {
        logging.INFO(className, methodName, "Token : " + req.cookies.token);
        req.headers.authorization = `Bearer ${req.cookies.token}`;
      }
      let claims = JSON.parse(base64.decode(req.headers.authorization.split(' ')[1].split('.')[1]));
      if(claims === null || claims === undefined){
        logging.INFO(className, isAuthenticated.name, req.headers.authorization);
        logging.INFO(className, isAuthenticated.name, "claims isn't valid");

        return res.sendStatus(403);
      }
      if(claims.application_id == undefined || claims.application_id == null ){
        logging.INFO(className, isAuthenticated.name, claims);
        logging.INFO(className, isAuthenticated.name, "claims.application isn't valid");
        return res.json(claims);
      }

      let applicationId = claims.application_id;
      logging.INFO(className, methodName, "ApplicationID: " + applicationId);
      config.secrets.forEach(function(secret){

        if(secret.id === applicationId){
          applicationfound = true;
          let validateJwt   = expressJwt({
            secret: secret.secret
          });
          logging.INFO(className, methodName, secret);
          if(validateJwt === undefined){
            return res.sendStatus(403);
          }

          validateJwt(req, res, next);
        }
      });
    });
};

export function hasRole (roleRequired) {
  let methodName   = "hasRole";
  logging.INFO(className, methodName);

  let roles = ['sys-admin', 'admin', 'faculty', 'user', 'viewer'];
  if(!roleRequired) {
    throw new Error('Required role needs to be set');
  }
  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      let isAuthenticated = false;
      let userApplication = req.user;
      logging.INFO(className, methodName, "looping user.applications" + userApplication.application_id);
      userApplication.roles.forEach(function(userRole){
        logging.INFO(className, methodName, "looping userApplication.roles " + userRole);
        if(!isAuthenticated && roles.indexOf(userRole) >= roles.indexOf(roleRequired))
        {
          isAuthenticated = true;
          return next();
        }
      });

      logging.INFO(className,methodName,"isAuthenticated : " + isAuthenticated);
      if(!isAuthenticated)
      {
        logging.INFO(className, methodName, "sending status 403");
        res.sendStatus(403);
      }
    });
};

export function hasKey(){
  return compose()
    .use(function(req, res, next){
      logging.INFO(className, hasKey.name, "checking key");

      let isAuthenticated = false;

      if(req.query.appKey !== undefined && req.query.appSecret !== undefined){

        config.applicationAuth.forEach(function(application){
          if(application.id === req.query.appKey && application.secret === req.query.appSecret){
            isAuthenticated = true;
            return next();
          }
        });

      }
      logging.INFO(className,hasKey.name,"isAuthenticated : " + isAuthenticated);
      if(!isAuthenticated)
      {
        logging.INFO(className, hasKey.name, "sending status 403");
        res.sendStatus(403);
      }
    })
}

export function generateRefreshToken() {
  let result = '';
  let chars  = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 24; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

  return result;
}
