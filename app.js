// Set root directory as a global variable
var path = require('path');
global.appRoot = path.resolve(__dirname);

// Begin building app
var express = require('express');
var db = require('./utils/db');
var app = express();
const fs = require('fs')

const PUBLIC_DIR = 'public';
const PRIVATE_DIR = 'private';
const ABS_PUBLIC_DIR = __dirname + '/' + PUBLIC_DIR;
const ABS_PRIVATE_DIR = __dirname + '/' + PRIVATE_DIR;

//var UserController = require('./user/UserController');
//app.use('/users', UserController);

// ==============================
// ===== API
// ==============================

// SITE
var Site_AuthController = require('./api/v1/site/auth/AuthController');
app.use('/api/v1/site/auth', Site_AuthController);
var Site_ChatController = require('./api/v1/site/chat/ChatController');
app.use('/api/v1/site/chat', Site_ChatController);

// ADMIN
var API_v1_Admin_InitController = require('./api/v1/admin/InitController');
app.use('/api/v1/admin/init', API_v1_Admin_InitController);

//var Admin_AuthController = require('./api/v1/admin/auth/AuthController');
//app.use('/api/v1/admin/auth', Admin_AuthController);

var API_v1_Admin_User_UserController = require('./api/v1/admin/user/UserController');
app.use('/api/v1/admin/user', API_v1_Admin_User_UserController);

var API_v1_Admin_SiteUser_SiteUserController = require('./api/v1/admin/siteUser/SiteUserController');
app.use('/api/v1/admin/siteUser', API_v1_Admin_SiteUser_SiteUserController);

var API_v1_Admin_Visitor_VisitorController = require('./api/v1/admin/visitor/VisitorController');
app.use('/api/v1/admin/visitor', API_v1_Admin_Visitor_VisitorController);

var API_v1_Admin_User_Auth_AuthController = require('./api/v1/admin/user/auth/AuthController');
app.use('/api/v1/admin/user/auth', API_v1_Admin_User_Auth_AuthController);

var API_v1_Admin_User_Permissions_PermissionsController = require('./api/v1/admin/user/permissions/PermissionsController');
app.use('/api/v1/admin/user/permissions', API_v1_Admin_User_Permissions_PermissionsController);

var API_v1_Admin_User_Email_EmailController = require('./api/v1/admin/user/email/EmailController');
app.use('/api/v1/admin/user/email', API_v1_Admin_User_Email_EmailController);

// API DOCS
var ApiDocsContoller = require('./api/v1/apiDocs/ApiDocsController');
app.use('/api/v1/apiDocs', ApiDocsContoller);



// ==============================
// ===== PAGES
// ==============================

app.use(express.static(PUBLIC_DIR));

// Home
/*app.get('', function(req, res) { res.sendFile(ABS_PUBLIC_DIR + '/home.html'); });
app.get('/', function(req, res) { res.sendFile(ABS_PUBLIC_DIR + '/home.html'); });
app.get('/home', function(req, res) { res.sendFile(ABS_PUBLIC_DIR + '/home.html'); });*/

// Public Pages
/* final catch-all route to index.html defined last */
app.get('/*', function(req, res) {
	const path = ABS_PUBLIC_DIR + req.url.toLowerCase() + ".html";
	if (fs.existsSync(path)) {
  		res.sendFile(path);
	} else {
  		res.sendFile(ABS_PUBLIC_DIR + '/index.html');
	}
});


// app.js
module.exports = app;