var mongoose = require('mongoose');  
var GameStudioSchema = new mongoose.Schema({  
  name: String,
  email: [{ type: String, lowercase: true }],
  gamesMax: { type: Number, default: 0 },
  gameModes: { type: Number, default: 0 },
  games: {},
});
mongoose.model('Game_Studio', GameStudioSchema);

module.exports = mongoose.model('Game_Studio');
