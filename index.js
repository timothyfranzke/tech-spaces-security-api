// =================================================================
// get the packages we need ========================================
// =================================================================
var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var compose     = require('composable-middleware');

var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport    = require("passport");
var passportJWT = require("passport-jwt");
var expressJwt  = require('express-jwt');
var guard       = require('express-jwt-permissions')();

var bcrypt      = require('bcrypt');

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./server/configuration/configuration'); // get our config file
var User   = require('./server/models/user'); // get our mongoose model
var Application = require('./server/models/application');
var SpacesToken = require('./server/models/token');
var PasswordReset = require('./server/models/passwordReset');
var auth          = require('./server/services/auth/auth.service');

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';

var roles = ['sys-admin', 'admin', 'faculty', 'user', 'viewer'];
var port = 3009; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", express.static(__dirname + '/client'));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

var validateJwt = expressJwt({
  secret: jwtOptions.secretOrKey
});

var getSecret = function(applicaitonID){
  var appSecret = "";
  config.secrets.forEach(function(secret){
    if(secret.id === applicaitonID)
    {
      appSecret = secret.secret;
    }
  });
  console.log("applicaiton secret");
  console.log(appSecret);
  console.log("applicationid");
  console.log(applicaitonID);

  return appSecret;
};

var isAuthenticated = function(){
  return compose()
  // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.access_token}`;
      }
      // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
      if(req.query && typeof req.headers.authorization === 'undefined') {
        req.headers.authorization = `Bearer ${req.cookies.token}`;
      }
      validateJwt(req, res, next);
    });
};

var hasRole = function (roleRequired) {
  if(!roleRequired) {
    throw new Error('Required role needs to be set');
  }
  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      let isAuthenticated = false;
      req.user.applications.forEach(function(userApplication){
        if(userApplication.application_id === '59e178a8734d1d1c37fc3c52'){
          userApplication.roles.forEach(function(userRole){
            if(!isAuthenticated && roles.indexOf(userRole) >= roles.indexOf(roleRequired))
            {
              isAuthenticated = true;
            }
          });
          if(isAuthenticated) {
            return next();
          } else {
            return res.status(403).send('Forbidden');
          }
        }
      });
    });
};

app.post("/login", function(req, res) {

  if(req.body.email && req.body.password){
    var email = req.body.email;
    var password = req.body.password;
  }
  User.findOne({
    email: email
  }, function(err, user){
    if( user == null ){
      res.status(401).json({message:"email/password incorrect"});
    }
    else {
      console.log("application id");
      console.log(applicationId);
      if(bcrypt.compareSync(req.body.password, user.password)) {
        var maxRole = {value: -1};
        var applicationId = user.applications[0].application_id;
        console.log("application id");
        console.log(applicationId);

        Application.findById(applicationId, function(err, application) {
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
          var payload = {id: user.id, roles: user.applications[0].roles, application_data: user.application_data, applications:user.applications};
          var token = jwt.sign(payload, application.secret, {
            expiresIn: 60 * 60 * 5,
            audience: application.audience,
            issuer: 'https://www.tech-spaces-security.com'
          });

          var tokenRecord = new SpacesToken();
          tokenRecord.expiresIn = 60 * 60 * 24;
          tokenRecord.token = token;
          tokenRecord.refreshToken = generateRefreshToken();

          tokenRecord.save(function (err, tokenResult) {
            console.log(tokenResult);
            res.json({message: "ok", redirect: maxRole.redirect_url + '/' + tokenResult._id});
          });
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

});

app.post("/token/:id", function(req, res){

  SpacesToken.findById(req.params.id, function(err, tokenResult){
      console.log(tokenResult);
      if(!!err) res.sendStatus(500);
      if(!tokenResult.isActive) res.status(403).send("Token invalid");
      if(tokenResult.isSingleAccessExpired == true) res.status(403).send("Token invalid");
      else {
        SpacesToken.findByIdAndUpdate(req.params.id, {"isSingleAccessExpired": true}, function(err, tokenUpdateResult){
          let response = {
            accessToken : tokenResult.token,
            refreshToken : tokenResult.refreshToken
          };

          res.json(response);
        })
      }
  })
});

app.get("/applications/:application_id", function(req, res){
  let applicationId = req.params.application_id;
  jwtOptions.secretOrKey = getSecret(applicationId);

  let validate = expressJwt({
    secret:  getSecret(applicationId)
  });

  validate(req,res,function(err, result){
    if (err) res.status(401);


  })

});

app.post("/send-reset-password", function(req, res){
  var host = req.get('host');
  if(typeof host == "undefined" || host.includes('localhost'))
  {
    host = 'k-spaces.herokuapp.com';
  }
  host = 'k-spaces.herokuapp.com';
  console.log("Heroku host: " + host);
  Application.findOne({audience:host}, function(err, applicationResult) {
    if (applicationResult == null) {
      res.status(403);
    }
    User.findOne({email: req.body.email}, function(err, userResult){
      var passwordReset = new PasswordReset();
      passwordReset.resetToken = generateRefreshToken();
      passwordReset.userId = userResult._id;

      passwordReset.save(function(err, passwordResetResult){
        var mail = "<p>Click the following link to reset your password</p><p><a href='" + applicationResult.reset_password_redirect + "/" + passwordReset.resetToken + "'>link</a></p>";
        var message = {
          to: req.body.email,
          subject: "Reset your password",
          body: mail
        };

        sendEmail(message, res.send(passwordReset.resetToken));
      });
    })
  });
});

app.post("/reset-password", function(req, res){
  PasswordReset.findOneAndUpdate({resetToken: req.body.token, isResetTokenExpired: false}, {isResetTokenExpired: true}, function(err, passwordResetResult){
    if (!!err) res.status(500).send("an error occurred");
    if (passwordResetResult == null || passwordResetResult.userId == undefined) res.status(401).send("invalid token");
    else {
      var salt = bcrypt.genSaltSync();
      var newPassword = bcrypt.hashSync(req.body.password, salt);
      User.findByIdAndUpdate(passwordResetResult.userId, {password:newPassword}, function(err, userResult){
        if (!!err) res.status(500).send("an error occurred");

        res.sendStatus(200);
      })
    }
  });
});

app.post("/role/:id", hasRole('sys-admin'), function(req, res){
  let role = req.body.role;
  let id = req.params.id;
  User.findById(id, function(err, user){
    if (err)
    {
      res.status(400);
    }
    user.roles.push(role);
    user.save();

    res.sendStatus(200);
  })
});

app.post("/forgotpassword", function(req, res){

});

app.post('/register', function(req, res){
  var salt = bcrypt.genSaltSync();
  var password = bcrypt.hashSync(req.body.password, salt);
  var user = new User();
  user.email = req.body.email;
  user.password = password;
  if(!!req.body.application_data)
  {
    user.application_data = req.body.application_data;
  }

  user.save(function(err, newUser){
    var payload = {id: newUser._id, permissions: ['admin', 'faculty']};
    var token = jwt.sign(payload, jwtOptions.secretOrKey, {
      expiresIn: 60 * 60 * 5
    });
    res.json({message: "ok", access_token: token, id: newUser._id});
  });
});

app.post('/register-email', function(req, res){
  var salt = bcrypt.genSaltSync();
  var password = bcrypt.hashSync(req.body.password, salt);
  var user = new User();

  user.email = req.body.email;
  user.password = password;
  user.applications = [];

  Application.findById(req.body.application_id, function(err, applicationResult) {
    if (applicationResult == null) {
      res.status(403);
    }
    console.log(applicationResult);
    var validator = expressJwt({
      secret: applicationResult.secret
    });

    validator(req,res,function(err, response){
      if(err!== undefined && err !== null)
      {
        console.log("error is here");
        res.sendStatus(401);
      }
      else {
        console.log(response);
        var application = {
          application_id: req.body.application_id,
          roles:[]
        };

        application.roles.push(req.body.role);
        user.applications.push(application);
        if(!!response.entity_id)
        {
          user.application_data = {"entity_id":response.entity_id}
        }
        if(!!response.vendor_id) {
          user.application_data = {"vendor_id":response.vendor_id}
        }

        User.create(user, function(err, newUser){
          var passwordReset = new PasswordReset();
          passwordReset.resetToken = generateRefreshToken();
          passwordReset.userId = newUser._id;

          passwordReset.save(function(err, passwordResetResult){
            var mail = "<p>An account has been created for you. Click the link to create your password.</p><p><a href='" + applicationResult.reset_password_redirect + "/" + passwordReset.resetToken + "'>link</a></p>";
            var message = {
              to: req.body.email,
              subject: "Reset your password",
              body: mail
            };
            let id_response = {
              "id":newUser._id
            };
            sendEmail(message, res.send(id_response));
          });
        });
      }
    });
  });

});

app.use(passport.initialize());

// use morgan to log requests to the console
app.use(morgan('dev'));

// basic route (http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

var apiRoutes = express.Router();
app.use('/api', apiRoutes);

app.listen(port);
console.log('Magic happens at http://localhost:' + port);

function generateRefreshToken() {
  var result = '';
  var chars  = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var i = 24; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

  return result;
}

function sendEmail(message, callback) {
  var nodemailer = require('nodemailer');
  let smtpConfig = {
    host: 'seagull.arvixe.com',
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: 'sparrow@franzkedesigner.com',
      pass: 'dfg123'
    }
  };
  let mailOptions = {
    from: 'no-reply@k-spaces.com',
    to: message.to, // list of receivers
    replyTo: 'timothyfranzke@gmail.com',
    subject: message.subject, // Subject line
    html: message.body// html body
  };
  let transporter = nodemailer.createTransport(smtpConfig);

// send mail with defined transport object
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      callback(error);
    }
    callback(null, info);
  })
}

