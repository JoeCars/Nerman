const { model, Schema, SchemaTypes } = require('mongoose');

const PollChannelSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      channelId: { type: String, required: true, unique: true },
      allowedRoles: [{ type: String, required: true, default: {} }],
      duration: { type: Number, required: true },
      maxUserProposal: { type: Number, default: 1 },
      anonymous: { type: Boolean, default: false },
      liveVisualFeed: { type: Boolean, default: false },
      voteAllowance: { type: Boolean, required: true, default: false },
      quorum: { type: Number, default: 1 }, // leaving default as 1 for testuing purposes
   },
   {
      statics: {
         async configExists(channelId) {
            const configExists = await this.countDocuments({
               channelId: new RegExp(channelId, 'i'),
            }).exec();

            console.log('STATIC',{ configExists });
            console.log('STATIC',!configExists);
            console.log('STATIC',!!configExists);
            return !!configExists;
         },
      },
   }
);

// const PollChannelSchema = new Schema({
//    _id: Schema.Types.ObjectId,
//    channelId: { type: String, required: true, unique: true },
//    // channelName: { type: String, required: true },
//    duration: { type: Number, required: true },
//    voteAllowance: { type: Number, required: true, default: 1 },
//    allowanceOptions: {
//       type: [String],
//       default: ['1/option'],
//       enum: ['1/option', 'Compounding'],
//    },
//    maxUserProposal: { type: Number, default: 1 },
//    anonymous: { type: Boolean, default: false },
//    // liveVisualFeed: { type: Boolean, default: false },
//    quorum: { type: Number, default: 1 }, // leaving default as 1 for testuing purposes
//    allowedRoles: [{ type: String, required: true, default: {} }],
// });

PollChannelSchema.virtual('durationMs').get(function () {
   console.log('DURATIONNNNNNNNN', this.duration);
   return Math.round(this.duration * 60 * 60 * 1000);
});

// Should look into:
// Optimistic Concurrency => https://mongoosejs.com/docs/5.x/docs/guide.html#optimisticConcurrency
// Indexing && Secxondary Indexes || Compound Indexing => https://mongoosejs.com/docs/5.x/docs/guide.html#indexes
// Virtuals => https://mongoosejs.com/docs/5.x/docs/guide.html#virtuals

module.exports = model('channelConfig', PollChannelSchema);

// User.findById({
//    _id,
// })
//    .select('participation')
//    .exec(callback)
//    .then(data => {
//       // do whatever
//    })
//    .catch(err => console.error(err));
