const { TextChannel } = require('discord.js');

const UrlConfig = require('../../../db/schemas/UrlConfig');
const Logger = require('../../../helpers/logger');
const {
   generateFederationBidEmbed,
   generateFederationVoteEmbed,
} = require('../../../views/embeds/contracts/federation');

module.exports = {
   name: 'federation',

   /**
    * @param {TextChannel} channel
    * @param {{
    *    eventName: string
    * }} data
    */
   async execute(channel, data) {
      try {
         const urls = await UrlConfig.fetchUrls(channel.guildId);
         let embed;

         switch (data.eventName) {
            case 'BidPlaced':
               embed = generateFederationBidEmbed(data, urls.propUrl, true);
               break;
            case 'VoteCast':
               embed = generateFederationVoteEmbed(data, urls.propUrl, true);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Federation events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(`events/nouns/federation.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         Logger.error('events/nouns/federation.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
