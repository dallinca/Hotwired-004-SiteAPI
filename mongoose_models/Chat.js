var mongoose = require('mongoose');
var ChatSchema = new mongoose.Schema({
	name: String,
    messages: [{ body: String, date: Date, name: String }]
});
mongoose.model('Chat', ChatSchema);

module.exports = mongoose.model('Chat');