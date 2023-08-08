const { TextChannel } = require('discord.js');
const UrlConfig = require('../../../../db/schemas/UrlConfig');

const {
   generateFederationBidEmbed,
} = require('../../../../views/embeds/federation/bidPlaced');
const Logger = require('../../../../helpers/logger');

module.exports = {
   name: 'federationVoteCast',
   /**
    *
    * @param {TextChannel} channel
    * @param {{
    *    dao: string,
    *    propId: number,
    *	   support: number,
    *	   supportVote: string,
    *	   amount: number,
    *	   bidder: string,
    *	   bidderName: string,
    * }} data
    */
   async execute(channel, data) {
      try {
         const urls = await UrlConfig.fetchUrls(channel.guildId);
         const embed = generateFederationBidEmbed(data, urls.propUrl, true);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/nouns/federation/voteCast.js: Received error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/federation/voteCast.js: Finished printing an auction bid.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
