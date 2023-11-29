const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateJoinForkEmbed,
} = require('../../../views/embeds/contracts/nouns-dao');

module.exports = {
   name: 'joinFork',
   /**
    * @param {TextChannel} channel
    * @param {{forkId: number,
    * owner: {name: string, id: string},
    * tokenIds: number[],
    * proposalIds: number[],
    * reason: reason
    * }} data
    */
   async execute(channel, data) {
      try {
         const embed = generateJoinForkEmbed(data);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error('events/nouns/joinFork.js: Received error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/customEvents/nouns/joinFork.js: Finished sending joinFork post.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
