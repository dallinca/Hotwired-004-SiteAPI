var mongoose = require('mongoose');

var DescriptionSection = new mongoose.Schema({
	type: { type: String, required: true },
	para: String,
	list: String,
	code: String
});

var SingleOption = new mongoose.Schema({
	required: { type: Boolean },
	name: { type: String, required: true },
	values: [String],
	sections: [{ type: DescriptionSection }]
});

var OptionClass = new mongoose.Schema({
	name: { type: String, required: true },
	explanation: String,
	options: [{ type: SingleOption }]
});

var EndpointMethod = new mongoose.Schema({
	type: { type: String, required: true },
	requestHeaders: { type: OptionClass },
	queryParameters: { type: OptionClass },
	requestBody: { type: OptionClass },
	responseStatusCodes: { type: OptionClass },
	responseBody: { type: OptionClass }
});

var apiDocSchema = new mongoose.Schema({
	name: { type: String, required: true },
	baseRoute: { type: [String], required: true },
	localRoute: { type: String, required: true },
	methods: { type: [EndpointMethod] }

});
mongoose.model('ApiDoc', apiDocSchema);

module.exports = mongoose.model('ApiDoc');