const { model, Schema } = require('mongoose');

const voteSchema = new Schema({
   _id: Schema.Types.ObjectId,
   poll: {
      type: Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
   },
   user: {
      type: String,
      required: true,
      default: '000000000000000000'
   },
   choices: {
      type: [String],
      required: true,
   },
   reason: {
      type: String,
      default: '',
   },
}, {
   timestamps: { createdAt: 'timeCreated', updatedAt: 'modified' },
});

module.exports = model('Vote', voteSchema);
