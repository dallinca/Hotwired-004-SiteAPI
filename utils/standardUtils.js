// Set Root Folder path
var pathToRootFolder = '../';

// Standard Configs
const config = require(pathToRootFolder + 'config/config');

// Standard Requires -- ALL CONTROLLERS
const logger = require(pathToRootFolder + 'utils/logger');
const { verifyToken, cacheTokenOwnerInfo, verifyPermission } = require(pathToRootFolder + 'utils/VerifyToken');
const errorCode = require(pathToRootFolder + 'utils/errorCodes.js');
const translations = require(pathToRootFolder + 'utils/translations.js');

// Prep router -- ALL CONTROLLERS
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

module.exports = (fileName) => {
    return {
        config,
        logger,
        verifyToken, cacheTokenOwnerInfo, verifyPermission,
        'errorCode': errorCode(fileName),
        'translations': translations(fileName),
        express, router, bodyParser
    }
};