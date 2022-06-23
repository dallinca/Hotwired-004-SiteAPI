// Set Root Folder path
var pathToRootFolder = '../';

const config = require(pathToRootFolder + 'config/config');
const logger = require(pathToRootFolder + 'utils/logger');

const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({ // Prep Email Transport -- create reusable transporter object using the default SMTP transport
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      type: 'OAuth2',
      user: config.email.from,
      serviceClient: config.email.serviceClient,
      privateKey: config.email.privateKey,
      scope: config.email.scope
    },
});

async function sendEmail(emailData){
    let sentEmailInfo = await transporter.sendMail(emailData);
    logger.info("Email sent to %s: %s", emailData.to, sentEmailInfo.messageId);
    return;
}

module.exports = { transporter, sendEmail }