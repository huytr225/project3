
var roomSchema=mongoose.Schema({
  ts: {
    type: Date,
    default: Date.now
  },
  name: String,
  msgs: Number,
  usernames: [{
    id: mongoose.Schema.Types.ObjectId,
    user_name:String,
    }]
});

module.exports = mongoose.model('Room',roomSchema);
