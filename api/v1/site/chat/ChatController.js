// ChatController.js
var pathToRootFolder = '../../../../';

// Prep router
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Prep Auth
var VerifyToken = require(pathToRootFolder + 'utils/VerifyToken');
var LoadUserInfo = require(pathToRootFolder + 'api/v1/site/auth/LoadUserInfo');

// Prep models
var Chat = require(pathToRootFolder + 'mongoose_models/v1/site/Chat');

// Prep Additional Libraries
// ..

// Settings
var GENERAL_CHAT_PERSISTANCE = 5; // minutes

// ==============================
// ===== Helping Functions
// ==============================


function initGeneralChat(req, res, next) {

  // Check that general chat has initialized
  Chat.findOne({ name: 'general' }, function(err, results) {
    if (err) return res.status(500).send({ auth: true, message: 'Error on the server.' });
    if (!results) {

      // Init general chat
      var generalChat = new Chat({ name: 'general',  });
      generalChat.save(function(err) {
        if (err) return res.status(500).send({ auth: true, message: 'Error on the server.' });
          next()
      });
    } else {
      next()
    }
  });

}

function getGeneralChat(req, res, next) {
  var timeString = req.query['time'];
  var timeObj = Date.parse(timeString);
  var timeValid = true;

  if (!timeString || isNaN(timeObj)) {
    timeValid = false;
  }

  Chat.findOne({ name: 'general' }, { _id: 0, name: 0, "messages._id": 0 }, function(err, results) {

    if (err) return res.status(500).send({ auth: true, message: 'Error on the server.' });
    if (!results) return res.status(500).send({ auth: true, message: 'Error on the server.' });

    res.locals.generalMessages = results.messages;
    res.locals.clippedMessages = sliceMessagesSinceMinutes(results.messages, GENERAL_CHAT_PERSISTANCE);
    res.locals.returnMessages = res.locals.clippedMessages;

    if (timeValid) {
      res.locals.returnMessages = sliceMessagesSinceDate(results.messages, timeObj);
    }

    next()
  });
}

function clipGeneralChat(req, res, next) {

  // Add the message
  Chat.updateOne({ name: 'general' }, { $set: { messages: res.locals.clippedMessages }}, function(err, results) {
    if (err) return res.status(500).send({ auth: true, message: 'Error on the server.' });
    if (!results) return res.status(500).send({ auth: true, message: 'Error on the server.' });

    next()
  });
}

function sliceMessagesSinceDate(messages, dateObj) {

  // Find first new message
  var newMessageIndex = -1;
  for (var i = 0; i < messages.length; i++) {
    if (messages[i].date > dateObj) {
      newMessageIndex = i;
      break;
    }
  }

  // Slice out unneeded messages from array
  var messagesToReturn = [];
  if (newMessageIndex > -1) {
    messagesToReturn = messages.slice(newMessageIndex);
  }

  return messagesToReturn;
}

function sliceMessagesSinceMinutes(messages, minutes) {

  var totalMilliseconds = minutes * 60 * 1000;
  var currentDate = new Date();
  var pastDate = new Date(currentDate.getTime() - totalMilliseconds);

  return sliceMessagesSinceDate(messages, pastDate);
}

// ==============================
// ===== Routes
// ==============================

router.get('/general', [initGeneralChat, getGeneralChat, clipGeneralChat], function(req, res, next) {
  return res.status(200).send({ auth: true, message: 'success', chat: res.locals.returnMessages });
});

router.post('/general', [VerifyToken, LoadUserInfo], function(req, res, next) {

  // Verify message is set
  if (!req.body || !req.body.message) {
    return res.status(404).send({ auth: true, token: null, message: 'Must provide body of message' });
  }
  
  // Prep message
  var newMessage = {
    body: req.body.message,
    date: new Date(),
    name: res.locals.userInfo.name
  }

  // Add the message
  Chat.updateOne({ name: 'general' }, { $push: { messages: newMessage }}, function(err, results) {
    if (err) return res.status(500).send({ auth: true, message: 'Error on the server.' });
    if (!results) return res.status(500).send({ auth: true, message: 'Error on the server.' });

    return res.status(200).send({ auth: true, message: 'success' });
  });
});



// add this to the bottom of AuthController.js
module.exports = router;