
var propertySchema=mongoose.Schema({
  name: String,
  rooms: [mongoose.Schema.Types.ObjectId],
  status: { 
    type: Boolean, default: false 
  }
});

module.exports = mongoose.model('Property',propertySchema);
