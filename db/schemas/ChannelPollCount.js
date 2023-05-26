const { model, Schema, Types } = require('mongoose');

const Logger = require('../../helpers/logger');

const ChannelPollCountSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      channelId: { type: String, required: true },
      pollsCreated: { type: Number, required: true, default: 0 },
   },
   {
      statics: {
         async checkExists(channelId) {
            return await this.exists({ channelId: new RegExp(channelId, 'i') });
         },
         async createCount(channelId) {
            Logger.debug(
               'db/schemas/ChannelPollCount.js: Attempting to create channel poll count.',
               {
                  channelId: channelId,
               }
            );
            try {
               const newPollCount = await this.create(
                  [
                     {
                        _id: new Types.ObjectId(),
                        channelId: channelId,
                        pollsCreated: undefined,
                     },
                  ],
                  { new: true }
               ).then(x => x[0]);

               Logger.debug(
                  'db/schemas/ChannelPollCount.js: Attempting to create channel poll count.',
                  {
                     channelId: channelId,
                     pollCount: newPollCount,
                  }
               );

               return newPollCount;
            } catch (error) {
               Logger.error(
                  'db/schemas/ChannelPollCount.js: Error when creating count.',
                  {
                     error: error,
                  }
               );
            }
         },
      },
      methods: {
         async increment() {
            this.$inc('pollsCreated', 1);
            return await this.save();
         },
      },
   }
);

module.exports = model('PollCount', ChannelPollCountSchema, 'PollCount');
