const { Schema, model, Types } = require('mongoose');
const events = require('../../utils/feedEvents');
const { filterEvents } = require('../../helpers/feeds');
const Logger = require('../../helpers/logger');

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
      options: {
         prophouse: {
            permittedHouses: [
               {
                  address: {
                     type: String,
                     required: true,
                  },
                  name: {
                     type: String,
                     required: true,
                  },
                  url: {
                     type: String,
                     required: true,
                  },
               },
            ],
         },
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
         async registerFeed(guildId, channelId, event, options = {}) {
            try {
               const numOfConfigs = await this.countDocuments({
                  guildId: guildId,
                  channelId: channelId,
                  eventName: event,
                  isDeleted: {
                     $ne: true,
                  },
               });

               if (numOfConfigs !== 0) {
                  return {
                     event: event,
                     isDuplicate: true,
                  };
               }

               await this.create({
                  _id: new Types.ObjectId(),
                  guildId: guildId,
                  channelId: channelId,
                  eventName: event,
                  options: options,
               });

               return {
                  event: event,
                  isDuplicate: false,
               };
            } catch (error) {
               Logger.error(
                  'db/schemas/FeedConfig.js: Unable to register feed.',
                  {
                     feed: event,
                     error: error,
                  },
               );

               throw new Error('Unable to register feed.');
            }
         },
         async registerAllProjectFeeds(
            guildId,
            channelId,
            projectName,
            options = {},
         ) {
            const eventResults = [];

            const feedEvents = filterEvents(projectName).map(({ value }) => {
               return value;
            });

            for (const feedEvent of feedEvents) {
               const results = await this.registerFeed(
                  guildId,
                  channelId,
                  feedEvent,
                  options,
               );
               eventResults.push(results);
            }

            return eventResults;
         },
      },
      methods: {
         async softDelete() {
            this.isDeleted = true;
            return this.save();
         },
         includesHouse(houseAddress) {
            if (!(this.options?.prophouse?.permittedHouses?.length > 0)) {
               return true; // All houses permitted if there are no options.
            }

            return this.options.prophouse.permittedHouses
               .map(house => house.address)
               .includes(houseAddress);
         },
      },
   },
);

module.exports = model('FeedConfig', FeedConfigSchema);
