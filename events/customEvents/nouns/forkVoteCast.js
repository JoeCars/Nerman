const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateForkVoteCastEmbed,
} = require('../../../views/embeds/contracts/nouns-fork');

module.exports = {
   name: 'forkVoteCast',
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
      const embed = generateForkVoteCastEmbed(vote);

      try {
         await channel.send({
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error('events/nouns/forkVoteCast.js: Received error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/nouns/forkVoteCast.js: Finished sending forkVoteCast embed.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
