const { Schema, model } = require('mongoose');

const NounsCandidateForum = new Schema({
   _id: Schema.Types.ObjectId,
   guildId: {
      type: String,
      required: true,
   },
   channelId: {
      type: String,
      required: true,
   },
   threads: {
      type: Map,
      required: true,
      default: new Map(), // (key, value) = (slug, threadId)
   },
   isDeleted: {
      type: Boolean,
      required: false,
      default: false,
   },
});

module.exports = model('NounsCandidateForum', NounsCandidateForum);
