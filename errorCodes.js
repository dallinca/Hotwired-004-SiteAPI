const errorCodes = {
    '/api/v1/site/auth/AuthController.js': '00001-'
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