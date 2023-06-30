const { model, Schema, SchemaTypes } = require('mongoose');

const Logger = require('../../helpers/logger');

const PollChannelSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      guildConfig: {
         type: Schema.Types.ObjectId,
         ref: 'GuildConfig',
         required: true,
      },
      channelId: {
         type: String,
         required: true,
         // unique: true,
         validate: {
            validator: async function (channelId) {
               Logger.info(
                  'db/schemas/PollChannel.js: Attempting to validate poll channel ID.',
                  {
                     channelId: channelId,
                  },
               );

               await this.populate('guildConfig');
               await this.guildConfig.populate('pollChannels');

               const noChannel = !this.guildConfig.pollChannels.find(
                  ({ channelId }) => channelId === this.channelId,
               );

               Logger.info(
                  'db/schemas/PollChannel.js: Finished validating poll channel ID.',
                  {
                     channelId: channelId,
                     noChannel: noChannel,
                  },
               );

               return noChannel;
            },
         },
      },
      allowedRoles: [{ type: String, required: true, default: {} }],
      duration: { type: Number, required: true },
      maxUserProposal: { type: Number, default: 1 },
      anonymous: { type: Boolean, default: false },
      liveVisualFeed: { type: Boolean, default: false },
      voteAllowance: { type: Boolean, required: true, default: false },
      forAgainst: { type: Boolean, required: true, default: false },
      quorum: { type: Number, default: 1 }, // leaving default as 1 for testuing purposes
      voteThreshold: { type: Number, default: 0 },
   },
   {
      statics: {
         async configExists(channelId) {
            const configExists = await this.countDocuments({
               channelId: new RegExp(channelId, 'i'),
            }).exec();

            return !!configExists;
         },
      },
      methods: {
         channelOptions() {
            const options = {
               anonymous: this.anonymous ?? false,
               liveVisualFeed: this.liveVisualFeed ?? false,
               voteAllowance: this.voteAllowance ?? false,
               forAgainst: this.forAgainst ?? false,
            };

            return options;
         },
      },
   },
);

// todo threshold dominationg vite needs to have 30% of the total eligible votes to win
// must pass voter quorum
// then after that passes, if the leading votes pases the threshold then we call that a pass

PollChannelSchema.virtual('durationMs').get(function () {
   Logger.debug('db/schemas/PollChannel.js: Checking poll channel duration', {
      duration: this.duration,
   });
   return Math.round(this.duration * 60 * 60 * 1000);
});

// Should look into:
// Optimistic Concurrency => https://mongoosejs.com/docs/5.x/docs/guide.html#optimisticConcurrency
// Indexing && Secxondary Indexes || Compound Indexing => https://mongoosejs.com/docs/5.x/docs/guide.html#indexes
// Virtuals => https://mongoosejs.com/docs/5.x/docs/guide.html#virtuals

module.exports = model('channelConfig', PollChannelSchema);
