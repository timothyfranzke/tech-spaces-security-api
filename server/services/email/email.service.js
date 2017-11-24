let nodemailer = require('nodemailer');
let className = 'email.service';
let config      = require('../../configuration/configuration');
let logging = require('../../services/logging/logging.service');

export function sendEmail(to, subject, body, callback) {
  let logger = logging.Logger(className, sendEmail.name, config.log_level);
  let smtpConfig = {
    host: 'mail.franzkedesigner.com',
    port: 25,
    secure: false,
    auth: {
      user: 'techspaces@franzkedesigner.com',
      pass: 'al-WU1!!kgK$'
    }
  };
  let mailOptions = {
    from: 'no-reply@kindercosmos.com',
    to: to, // list of receivers
    replyTo: 'admin@kindercosmos.com',
    subject: subject, // Subject line
    html: body// html body
  };
  let transporter = nodemailer.createTransport(smtpConfig);

// send mail with defined transport object
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      logger.ERROR(config.exceptions.GENERAL_EXCEPTION(err));
      callback(err);
    }
    else {
      callback(null, info);
    }
  })
}
