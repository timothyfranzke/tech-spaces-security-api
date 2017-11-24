// =================================================================
// get the packages we need ========================================
// =================================================================
let express  = require('express');
let app         = express();
let bodyParser  = require('body-parser');

let morgan      = require('morgan');
let mongoose    = require('mongoose');
let passport    = require("passport");
let passportJWT = require("passport-jwt");

let bcrypt      = require('bcrypt');

let ExtractJwt  = passportJWT.ExtractJwt;
let jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
let config      = require('./server/configuration/configuration'); // get our config file
let User        = require('./server/models/user'); // get our mongoose model
let Application = require('./server/models/application');
let PasswordReset = require('./server/models/passwordReset');
let auth          = require('./server/services/auth/auth.service');

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';

let port = 3009; // used to create, sign, and verify tokens
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

app.use("/api/application", require('./server/api/application'));
app.use("/api/register", require('./server/api/register'));
app.use("/login", require('./server/api/login'));
app.use("/password", require('./server/api/password'));
app.use("/token", require('./server/api/token'));


app.post("/send-reset-password", function(req, res){
  var host = req.get('host');
  if(typeof host == "undefined" || host.includes('localhost'))
  {
    host = 'k-spaces.herokuapp.com';
  }
  host = 'k-spaces.herokuapp.com';
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

app.post("/role/:id", auth.hasRole('sys-admin'), function(req, res){
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

app.use(passport.initialize());
// use morgan to log requests to the console
app.use(morgan('dev'));

let apiRoutes = express.Router();
app.use('/api', apiRoutes);

app.listen(port);

