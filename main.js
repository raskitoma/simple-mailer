// RSKMailer
// (c) 2023, Raskitoma.io

// Simple node program to allow mail send from a web page
const dotenv = require('dotenv');
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const moment = require('moment');
const app = express();
const host = '0.0.0.0'
const app_name = 'RSKMailer'

// load environment variables
console.log('Loading environment variables...');
dotenv.config();
const port = process.env.APP_PORT || 3001;
const appdebug = process.env.APP_DEBUG || '0'; // default to false
const mail_origin = process.env.MAIL_ORIGIN || '*';
const mail_transporter_str = process.env.MAIL_TRANSPORTER || `{ "service": "gmail", "auth": { "user": "youremail@gmail.com", "pass": "yourpassword" } }`; 
const mail_default_receiver = process.env.MAIL_DEFAULT_RECEIVER || 'myfriend@yahoo.com';
const mail_sender = process.env.MAIL_SENDER || 'youremail@gmail.com';
const mail_default_subject = process.env.MAIL_DEFAULT_SUBJECT || 'Hello from RSKMailer';
console.log('Environment variables loaded.');

// Setting up logger
function applogger(message, module='MSG', severity='info', extras='', request=null, response=null) {
    let time_now = moment().format();
    let method = 'SCRIPT';
    let browser = 'SCRIPT';
    let uri = 'SCRIPT';
    let ip = 'SCRIPT';
    let status_code = 0;
    if (request) {
        method = request.method || 'SCRIPT';
        browser = request.rawHeaders[15] || 'SCRIPT';
        uri = request.url || 'SCRIPT';
        ip = request.headers["x-forwarded-for"] || request.socket.remoteAddress || 'SCRIPT';
    }
    if (response) {
        if (response.statusCode) {
        status_code = response.statusCode;
        } else if (response.status) {
        status_code = response.status;
        }
    }
    let log_msg = `${time_now} | [${app_name}]-[${module}][${method}][${status_code}][${message}][${uri}][${ip}][${browser}][${extras}]`;
    if (severity == 'error') {
        console.error(log_msg);
    } else if (severity == 'warn') {
        console.warn(log_msg);
    }  else {
        console.log(log_msg);
    }
}
  
// cors fix
let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', `${mail_origin}`);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    next();
};

// set up server
console.log('Setting up...');
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const is_debug = appdebug=='1' ? true : false;

// Setting up mail transporter
console.log('Setting up mail transporter...');
const mail_transporter = JSON.parse(mail_transporter_str);
const transporter = nodemailer.createTransport(mail_transporter);

// Setting up default mail options

const defaultMailOptions = {
    from: mail_sender,
    to: mail_default_receiver,
    subject: mail_default_subject,
    text: 'Hello from RSKMailer',
};

// *********************************************************************************************************************
// APP Routes
  console.log('Prepping app routes...')
// Root route
app.get('/', (req, res) => {
  applogger('Client Request', 'REQUEST', 'info', '', req, res);
  res.send('RSKMailer - System Live & Listening');
});

app.post('/contact', (req, res) => {
    // if the requests doesn't comes from the allowed origins, return error
    if (mail_origin != '*' && mail_origin != req.headers.origin) {
        let error_msg = `Request from ${req.headers.origin} not allowed`;
        applogger('Request from not allowed origin', 'REQUEST', 'error', error_msg, req, res);
        // return error_msg to the client with status code 403
        res.send(error_msg).status(403);
    }

    applogger('Contact Request', 'CONTACT', 'info', '', req, res);
    let mailname = req.body.name || '';
    let mailfrom = req.body.email || mail_sender;
    let mailmsg = req.body.message || '';
    let mailsubject = req.body.subject || mail_default_subject;

    let mailsbj = `Contact Request: ${mailsubject}`;
    let mailtxt = `From: ${mailname}<br>Email: ${mailfrom}<br><br>${mailmsg}`;

    const mailOptions = {
        from: mailfrom,
        to: mail_default_receiver,
        subject: mailsbj,
        html: mailtxt,
        text: mailtxt,
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            let error_msg = `Mail Send Error: ${error}`;
            applogger('Send Mail Error', 'MAILER', 'error', error_msg, req, res);
            // return error_msg to the client with status code 500
            res.send(error_msg).status(500);

        } else {
            let success_msg = `Mail Sent: ${info.response}`;
            applogger('Send Mail Success', 'MAILER', 'info', success_msg, req, res);
            // return success_msg as json with key 'status' value as 'sent' to the client with status code 200
            res.json({status: 'sent', message: success_msg}).status(200);
        }
    });
});

console.log('Starting up server...')
app.listen(port, host, () => {
  const time_now = moment().format();
  console.log(`${app_name} - System Live & Listening on http://${host}:${port} ======: ${time_now} :=====`);
});

