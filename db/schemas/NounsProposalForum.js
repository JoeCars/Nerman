const { Schema, model } = require('mongoose');

const NounsProposalForumSchema = new Schema({
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
      default: new Map(),
   },
});

module.exports = model('NounsProposalForum', NounsProposalForumSchema);
