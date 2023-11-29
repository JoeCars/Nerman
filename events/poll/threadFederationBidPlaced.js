const { TextChannel } = require('discord.js');

const Logger = require('../../helpers/logger');
const { findPollMessage } = require('../../helpers/poll/thread');
const {
   generateFederationBidEmbed,
} = require('../../views/embeds/contracts/federation');
const UrlConfig = require('../../db/schemas/UrlConfig');

module.exports = {
   name: 'threadFederationBidPlaced',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      try {
         const pollMessage = await findPollMessage(channel, data.propId);
         if (!pollMessage) {
            return;
         }
         const propUrl = (await UrlConfig.fetchUrls(channel.guildId)).propUrl;
         const threadEmbed = generateFederationBidEmbed(data, propUrl);
         await pollMessage.thread.send({
            content: null,
            embeds: [threadEmbed],
         });
      } catch (error) {
         return Logger.error(
            'events/poll/threadFederationBidPlaced.js: Received error.',
            {
               error: error,
               guildId: channel.guildId,
               channelId: channel.id,
            },
         );
      }

      Logger.info(
         'events/poll/threadFederationBidPlaced.js: Finished sending threadFederationBidPlaced.',
         {
            guildId: channel.guildId,
            channelId: channel.id,
         },
      );
   },
};
