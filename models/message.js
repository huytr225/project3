
var messageSchema=mongoose.Schema({
  rid: String,
  msg: String,
  ts: {
    type: Date,
    default: Date.now()
  },
  u: {
    id: mongoose.Schema.Types.ObjectId,
    user_name:String,
  }
    
});

module.exports = mongoose.model('Message',  messageSchema);
