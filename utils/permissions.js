var permissionsListByController = {}
var permissionsList = []


function verifyPermission(permission) {
  return function(req, res, next) {
    if (!res.locals.tokenOwnerInfo.permissions.includes(permission)) return res.status(403).send({ auth: false, message: 'Insufficient permissions' }); 
    next();
  }
}

/*function verifyPermission(permission) {
  return verifyPermission[permission] || (verifyPermission[permission] = function(req, res, next) {
    if (!res.locals.tokenOwnerInfo.permissions.includes(permission)) return res.status(403).send({ auth: false, token: null, token: null, message: 'Insufficient permissions' }); 
    next();
  })
}*/

function initControllerPermissions(originFilePath) {
  // Verify originating file path is provided
  if (!originFilePath) {
      console.log("Must supply filePath of file using permissions. Pass __filename, to the function returned by require.");
      return null;
  }
  var permissionsFolderPath = originFilePath + '.meta/permissions/';

  // Get current permissions supported for this file
  permissions = require(permissionsFolderPath + 'names.js');
  if (!permissions) {
      console.log("No names.js file available for the file to setup permissions: " + permissionsFolderPath);
      return null;
  }

  // Verify this file has not already compiled permissions
  if (permissionsListByController[originFilePath]) {
    throw "Controller already setup with permissions: " + originFilePath
  }
  permissionsListByController[originFilePath] = [];

  // Compile Permissions
  for (const permission in permissions) {
    // Verify the permission is not already registered (will cause unexpected access issues)
    if (permissionsList.includes(permission)) {
      throw "Permission name already used: " + permission + " Within controller " + originFilePath
    }
    permissionsList.push(permission);
    permissionsListByController[originFilePath].push(permission);
  }
}

function getAllPermissions() {
  return [...permissionsList] // Return a copy so that the values are not mutated by retrievers
}

function verifyPermissionNamesExist(permissionNames = []) {
  for (var i = 0; i < permissionNames.length; i++) {
    if (!permissionsList.includes(permissionNames[i])) {
      console.log('permission does not exist: ' + permissionNames[i]);
      return false
    }
  }
  return true
}

module.exports = { verifyPermission, initControllerPermissions, getAllPermissions, verifyPermissionNamesExist };