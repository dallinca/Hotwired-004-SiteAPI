// Standard Utilities
const {
	config,
	logger,
	verifyToken, cacheTokenOwnerInfo, verifyPermission,
	errorCode, // nextErrorCode = '00040'; // Only used for keeping loose track of next ID assignment
	translations,
	router,
} = require(global.appRoot + '/utils/standardUtils.js')(__filename);

// Prep Error Messages, Success Messages, Permission strings -- CONTROLLER SPECIFIC

// Prep models -- CONTROLLER SPECIFIC
var ApiDoc = require(global.appRoot + '/mongoose_models/v1/ApiDoc.js');

// Prep Additional Libraries -- CONTROLLER SPECIFIC
// ..


// ==============================
// ===== Helping Functions
// ==============================


function middlewareTemp(req, res, next) {

	next();

}

// ==============================
// ===== Routes
// ==============================

// Getting apiDocs info
router.get('/', function(req, res, next) {

	// Get the string
	var pathString = req.query.path;

	// Start building the query
	var findQuery = {};

	// Only use the pathString if longer that 1 character
	if (pathString.length > 1 && pathString[0] == "/") {
		// Remove leading slash
		pathString = pathString.substring(1);

		// Break path into parts
		var pathArray = pathString.split("/");

		// Specify each part of the path in the query
		for (var i = 0; i < pathArray.length; i++) {
			findQuery["baseRoute." + i] = pathArray[i];
		}
	}

	ApiDoc.find(findQuery, function(err, apiDocs) {
		if (err) return res.status(500).send({ auth: true, error: 500, message: 'Error on the server.', results: {} });
		if (!apiDocs.length) return res.status(200).send({ auth: true, error: 200, message: 'No apiDocs found.', results: {} });
		return res.status(200).send({ auth: true, error: 200, message: 'Returning all apiDocs', results: { "apiDocs": apiDocs } });
	});
	
});

// Adding new apiDocs info
router.post('/', function(req, res, next) {
	var messagesToReturn = "POST apiDocs /";
	console.log(messagesToReturn);

	// Check that the path doesn't already exist
	if (!req.body.apidoc) {
		return res.status(404).send({ auth: true, error: 404, message: 'Could not find "apiDoc" field', results: {} });
	}

	if (!req.body.apidoc.name) {
		return res.status(404).send({ auth: true, error: 404, message: 'Could not find "apiDoc.name" field', results: {} });
	}

	ApiDoc.find({ "name": req.body.apidoc.name }, function(err, apiDocs) {
		if (err) return res.status(500).send({ auth: true, error: 500, message: 'Error on the server.', results: {} });
		if (apiDocs.length) return res.status(400).send({ auth: true, error: 400, message: 'apidoc.name already exists in the database. Please use a unique name', results: {} });
	
		var newDoc = new ApiDoc(req.body.apidoc);

		newDoc.save(function(err, result){
			if (err) return res.status(500).send({ auth: true, error: err })
			console.log(err);
			console.log(result);
			return res.status(200).send({ auth: true, message: 'success', results: messagesToReturn });
		});

	});

});

// Updating apiDocs info
router.put('/', function(req, res, next) {

	ApiDoc.find({}, function(err, apiDocs) {
		if (err) return res.status(500).send({ auth: true, error: 500, message: 'Error on the server.', results: {} });
		if (!apiDocs.length) return res.status(200).send({ auth: true, error: 200, message: 'No apiDocs found.', results: {} });
		return res.status(200).send({ auth: true, error: 200, message: 'Returning all apiDocs', results: { "apiDocs": apiDocs } });
	});
	
});


// add this to the bottom of AuthController.js
module.exports = router;



/*
{
	"apidoc": {
		"name": "/api/apiDocz/test3",
		"localRoute": "test",
		"baseRoute": [ "api", "apiDocs" ],
		"methods": [
			{
				"type": "GET",
				"requestHeaders": {
					"name": "Request Headers",
					"explanation": "Always ensure that the required headers are included. Without them, responses will not be as expected.",
					"options": [
						{
							"required": true,
							"name": "x-access-token",
							"values": ["<jwt-token>"],
							"sections": [
								{
									"type": "para",
									"para": "Many requests require a current jwt token. See /api/auth for more details."
								}
							]
						}
					]
				},
				"queryParameters": {
					"name": "Query Parameters"
				},
				"requestBody": {
					"name": "Request Body"
				},
				"responseStatusCodes": {
					"name": "Response Status Codes"
				},
				"responseBody": {
					"name": "Response Body"
				}
			}
		]
	}
}
*/