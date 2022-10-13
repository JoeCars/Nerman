const { model, Schema, Types } = require('mongoose');

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
            console.log('outside trycatch', { channelId });
            try {
               console.log('inside trycatch', { channelId });

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

               console.log('from static', { newPollCount });

               return newPollCount;
            } catch (error) {
               console.error(error);
            }
         },
      },
      methods: {
         async increment() {
            console.log('this', this);
            this.$inc('pollsCreated', 1);
            console.log('this AFTER',this);
            return await this.save();
         },
      },
   }
);

module.exports = model('PollCount', ChannelPollCountSchema, 'PollCount');
