let base64      = require('base-64');
let logging     = require('../logging/logging.service');
let config      = require('../../configuration/configuration');
let jwt         = require('jsonwebtoken');

//models
let SpacesToken = require('../../models/token');

//constants
const CLASS_NAME = 'token.service';

export function getClaims(token){
  let logger = logging.Logger(CLASS_NAME, getClaims.name, config.log_level);
  let claims = {};

  try{
    logger.INFO("parsing claims from token : " + token);
    claims = JSON.parse(base64.decode(token.split(' ')[1].split('.')[1]));
  }
  catch(ex){
    logger.ERROR(ex, "Error while parsing claims from token");
  }
  return claims;
}

export function getSecret(applicaitonID){
  let appSecret = "";
  config.secrets.forEach(function(secret){
    if(secret.id === applicaitonID)
    {
      appSecret = secret.secret;
    }
  });

  return appSecret;
}

export function signAndSaveToken(secret, claims, audience, callback){

  let token =  jwt.sign(claims, secret, {
    expiresIn: 60 * 60 * 5,
    audience: audience,
    issuer: 'https://www.techspaces.com'
  });

  let tokenRecord = new SpacesToken();
  tokenRecord.expiresIn = 60 * 60 * 24;
  tokenRecord.token = token;
  tokenRecord.refreshToken = generateRefreshToken();

  tokenRecord.save(function (err, tokenResult) {
    let tokenId = tokenResult._id;
    callback(tokenId);
  });
}

export function generateRefreshToken() {
  let result = '';
  let chars  = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 24; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

  return result;
}
