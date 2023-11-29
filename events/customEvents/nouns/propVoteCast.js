const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const UrlConfig = require('../../../db/schemas/UrlConfig');
const {
   generatePropVoteCastEmbed,
} = require('../../../views/embeds/contracts/nouns-dao');

module.exports = {
   name: 'propVoteCast',
   /**
    * @param {TextChannel} channel
    * @param {{proposalId: string,
    *    voter: {id: string, name: string},
    *    choice: string,
    *    proposalTitle: string,
    *    votes: number,
    *    supportDetailed: number,
    *    reason: string}} vote
    */
   async execute(channel, vote) {
      const urls = await UrlConfig.fetchUrls(channel.guildId);
      const noticeEmbed = generatePropVoteCastEmbed(vote, urls.propUrl, false);
      const messageEmbed = generatePropVoteCastEmbed(vote, urls.propUrl, true);

      try {
         // Sending notification.
         const message = await channel.send({
            embeds: [noticeEmbed],
         });
         // Sending main message.
         await message.edit({
            embeds: [messageEmbed],
         });
      } catch (error) {
         return Logger.error('events/nouns/propVoteCast.js: Received error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/nouns/propVoteCast.js: Finished sending propVoteCast embed.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
