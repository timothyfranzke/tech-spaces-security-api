// let expressJwt  = require('express-jwt');
// let compose     = require('composable-middleware');
// let logging     = require('../logging/logging.service');
// let className   = "auth.service";
//
// export function isAuthenticated(appSecret){
//     let methodName   = "isAuthenticated";
//     let validateJwt   = expressJwt({
//         secret: appSecret
//     });
//     return compose()
//     // Validate jwt
//         .use(function(req, res, next) {
//
//             if(req.headers.authorization === undefined){
//                 res.sendStatus(403);
//             }
//             // allow access_token to be passed through query parameter as well
//             if(req.query && req.query.hasOwnProperty('access_token')) {
//                 logging.INFO(className, methodName, "Token : " + req.query.access_token);
//                 req.headers.authorization = `Bearer ${req.query.access_token}`;
//             }
//             // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
//             if(req.query && typeof req.headers.authorization === 'undefined' && typeof req.cookies.token !== 'undefined') {
//               logging.INFO(className, methodName, "Token : " + req.cookies.token);
//               req.headers.authorization = `Bearer ${req.cookies.token}`;
//             }
//             validateJwt(req, res, next);
//         });
// };
//
// export function hasRole (roleRequired, appSecret) {
//     let methodName   = "hasRole";
//     logging.INFO(className, methodName);
//
//     let roles = ['sys-admin', 'admin', 'faculty', 'user', 'viewer'];
//     if(!roleRequired) {
//         throw new Error('Required role needs to be set');
//     }
//     return compose()
//         .use(isAuthenticated(appSecret))
//         .use(function meetsRequirements(req, res, next) {
//             let isAuthenticated = false;
//             req.user.roles.forEach(function(role){
//                 if(!isAuthenticated && roles.indexOf(role) >= roles.indexOf(roleRequired))
//                 {
//                   logging.INFO(className, methodName, "HasRole : " + role);
//                     isAuthenticated = true;
//                 }
//             });
//             if(isAuthenticated) {
//                 return next();
//             } else {
//               logging.INFO(className, methodName, "User Unauthenticated");
//                 return res.status(403).send('Forbidden');
//             }
//         });
// };
