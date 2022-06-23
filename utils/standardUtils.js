// Set Root Folder path
var pathToRootFolder = '../';

// Standard Configs
const config = require(pathToRootFolder + 'config/config');

// Standard Requires -- ALL CONTROLLERS
const logger = require(pathToRootFolder + 'utils/logger');
const { verifyToken, cacheTokenOwnerInfo, verifyPermission } = require(pathToRootFolder + 'utils/VerifyToken');

// Prep router -- ALL CONTROLLERS
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/*module.exports = (fileName) => {
    return {
        config,
        logger,
        verifyToken, cacheTokenOwnerInfo, verifyPermission,
        'errorCode': errorCode(fileName),
        'translations': translations(fileName),
        express, router, bodyParser
    }
};*/

module.exports = (fileName) => {
    return {
        config,
        logger,
        verifyToken, cacheTokenOwnerInfo, verifyPermission,
        'errorCode': require(pathToRootFolder + 'utils/errorCodes.js')(fileName),
        'translations': require(pathToRootFolder + 'utils/translations.js')(fileName),
        express, router, bodyParser
    }
};