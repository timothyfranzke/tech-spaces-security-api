let nodemailer = require('nodemailer');
let className = 'email.service';
let config      = require('../../configuration/configuration');
let logging = require('../../services/logging/logging.service');

export function sendEmail(message, callback) {
  let logger = logging.Logger(className, sendEmail().name, config.log_level);
  let smtpConfig = {
    host: 'seagull.arvixe.com',
    port: 465,
    secure: true,
    auth: {
      user: 'sparrow@franzkedesigner.com',
      pass: 'dfg123'
    }
  };
  let mailOptions = {
    from: 'no-reply@kindercosmos.com',
    to: message.to, // list of receivers
    replyTo: 'admin@kindercosmos.com',
    subject: message.subject, // Subject line
    html: message.body// html body
  };
  let transporter = nodemailer.createTransport(smtpConfig);

// send mail with defined transport object
  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      logger.ERROR(config.exceptions.GENERAL_EXCEPTION(err));
      callback(error);
    }
    callback(null, info);
  })
}
