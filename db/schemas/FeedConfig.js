const { Schema, model, Types } = require('mongoose');
const events = require('../../utils/feedEvents');

const FeedConfigSchema = new Schema(
   {
      _id: Schema.Types.ObjectId,
      guildId: {
         type: String,
         required: true,
      },
      channelId: {
         type: String,
         required: true,
      },
      eventName: {
         type: String,
         enum: [...events.keys()],
         required: true,
      },
      isDeleted: {
         type: Boolean,
         required: false,
         default: false,
      },
   },
   {
      statics: {
         async findChannels(eventName) {
            return this.find({
               eventName: eventName,
               isDeleted: {
                  $ne: true,
               },
            }).exec();
         },
         async findFeedsInGuild(guildId) {
            return this.find({
               guildId: guildId,
               isDeleted: {
                  $ne: true,
               },
            }).exec();
         },
         async findFeedsInChannel(guildId, channelId) {
            return this.find({
               guildId: guildId,
               channelId: channelId,
               isDeleted: {
                  $ne: true,
               },
            }).exec();
         },
         async tryAddFeed(guildId, channelId, eventName) {
            let feed = await this.findOne({
               guildId: guildId,
               channelId: channelId,
               eventName: eventName,
               isDeleted: {
                  $ne: true,
               },
            }).exec();

            if (!feed) {
               feed = await this.create({
                  _id: new Types.ObjectId(),
                  guildId: guildId,
                  channelId: channelId,
                  eventName: eventName,
               });
            }

            return feed;
         },
      },
   },
);

module.exports = model('FeedConfig', FeedConfigSchema);
