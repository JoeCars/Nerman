const FeedConfig = require('../db/schemas/FeedConfig');
const Logger = require('../helpers/logger');

// https://discord.com/developers/docs/topics/opcodes-and-status-codes
const UNKNOWN_CHANNEL_ERROR_CODE = 10003;

class Router {
   constructor(client) {
      this.client = client;
   }

   async sendToFeed(data, feedName, eventName = '') {
      if (!eventName) {
         eventName = feedName;
      }

      const feeds = await FeedConfig.findChannels(feedName);
      for (const feed of feeds) {
         try {
            const channel = await this.client.channels.fetch(feed.channelId);
            this.client.emit(eventName, channel, data);
         } catch (error) {
            Logger.error(
               'helpers/router.js: Unable to retrieve feed channel.',
               {
                  channelId: feed.channelId,
                  guildId: feed.guildId,
                  feedEvent: feed.eventName,
               },
            );
            if (error.code === UNKNOWN_CHANNEL_ERROR_CODE) {
               feed.softDelete().catch(err => {
                  Logger.error('helpers/router.js: Feed soft-delete failed.', {
                     error: err,
                     channelId: feed.channelId,
                     guildId: feed.guildId,
                     feedEvent: feed.eventName,
                  });
               });
            }
         }
      }
   }
}

module.exports = Router;
