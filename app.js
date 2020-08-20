var express = require('express');
var app = express();
var db = require('./db');

const PUBLIC_DIR = 'public';
const PRIVATE_DIR = 'private';
const ABS_PUBLIC_DIR = __dirname + '/' + PUBLIC_DIR;
const ABS_PRIVATE_DIR = __dirname + '/' + PRIVATE_DIR;
console.log("ABS_PUBLIC_DIR: " + ABS_PUBLIC_DIR);
console.log("ABS_PRIVATE_DIR: " + ABS_PRIVATE_DIR);

//var UserController = require('./user/UserController');
//app.use('/users', UserController);

// ==============================
// ===== API
// ==============================

// Auth
var AuthController = require('./auth/AuthController');
app.use('/api/auth', AuthController);

// Chat
var ChatContoller = require('./api/chat/ChatController');
app.use('/api/chat', ChatContoller);

// Chat
var ApiDocsContoller = require('./api/apiDocs/ApiDocsController');
app.use('/api/apiDocs', ApiDocsContoller);



// ==============================
// ===== PAGES
// ==============================

app.use(express.static(PUBLIC_DIR));

// Home
app.get('', function(req, res) { res.sendFile(ABS_PUBLIC_DIR + '/home.html'); });
app.get('/', function(req, res) { res.sendFile(ABS_PUBLIC_DIR + '/home.html'); });
app.get('/home', function(req, res) { res.sendFile(ABS_PUBLIC_DIR + '/home.html'); });

// Public Pages
app.get('/contact', function(req, res) {
  	res.sendFile(ABS_PUBLIC_DIR + '/contact.html');
});

app.get('/about', function(req, res) {
  	res.sendFile(ABS_PUBLIC_DIR + '/about.html');
});

app.get('/profile', function(req, res) {
  	res.sendFile(ABS_PUBLIC_DIR + '/profile.html');
});

/* final catch-all route to index.html defined last */
app.get('/*', function(req, res) {
  	res.sendFile(ABS_PUBLIC_DIR + '/404.html');
});


// app.js
module.exports = app;