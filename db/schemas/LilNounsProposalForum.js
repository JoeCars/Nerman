const { Schema, model } = require('mongoose');

const LilNounsProposalForumSchema = new Schema({
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
   isDeleted: {
      type: Boolean,
      required: false,
      default: false,
   },
});

module.exports = model('LilNounsProposalForum', LilNounsProposalForumSchema);
