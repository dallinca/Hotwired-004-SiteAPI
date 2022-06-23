// Standard Configs
const config = require(global.appRoot + '/config/config');

// Standard Requires -- ALL CONTROLLERS
const logger = require(global.appRoot + '/utils/logger');
const { verifyToken, cacheTokenOwnerInfo, verifyPermission } = require(global.appRoot + '/utils/VerifyToken');

module.exports = (fileName) => {

    // Prep router -- ALL CONTROLLERS
    var express = require('express');
    var router = express.Router();
    var bodyParser = require('body-parser');
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());

    return {
        config,
        logger,
        verifyToken, cacheTokenOwnerInfo, verifyPermission,
        'errorCode': require(global.appRoot + '/utils/errorCodes.js')(fileName),
        'translations': require(global.appRoot + '/utils/translations.js')(fileName),
        express, router, bodyParser
    }
};