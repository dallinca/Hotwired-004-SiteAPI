// Next ErrorCode - 00009
const errorCodes = {
    '/api/v1/site/auth/AuthController.js': '00001-',

    '/api/v1/site/chat/ChatController.js': '00002-',
    
    '/api/v1/apiDocs/ApiDocsController.js': '00003-',

    '/api/v1/admin/user/UserController.js': '00004-',
    '/api/v1/admin/visitor/VisitorController.js': '00005-',
    '/api/v1/admin/user/auth/AuthController.js': '00006-',
    '/api/v1/admin/user/permissions/PermissionsController.js': '00007-',
    '/api/v1/admin/user/email/EmailController.js': '00008-',

    // Utilities
    '/utils/pagination.js': '00008-',
};

function GetErrorCodeBase(fileName) {
    var relativeFileName = fileName.replace(process.env.PWD,'');
    if (!errorCodes[relativeFileName]) {
        throw new Error('No error code assigned to file ' + relativeFileName);
    }
    
    const ERRORCODE_BASE = errorCodes[relativeFileName];
    function ProduceErrorCode(localCode) {
        return ERRORCODE_BASE + localCode;
    }
    return ProduceErrorCode;
}

module.exports = GetErrorCodeBase;