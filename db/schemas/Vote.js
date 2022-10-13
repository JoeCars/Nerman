const { model, Schema } = require('mongoose');

// Declare the Schema of the Mongo model
const voteSchema = new Schema({
   _id: Schema.Types.ObjectId,
   poll: {
      type: Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
   },
   user: {
      // type: mongoose.Schema.Types.ObjectId, ref: 'User',
      type: String,
      required: true,
   },
   choices: {
      type: [String],
      required: true,
      // find out how to evaluate for number of entries in Array SchemaType
   },
   reason: {
      type: String,
      default: '',
   },
});


//Export the model
module.exports = model('Vote', voteSchema);
