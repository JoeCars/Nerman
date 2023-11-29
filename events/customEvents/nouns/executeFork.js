const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateExecuteForkEmbed,
} = require('../../../views/embeds/contracts/nouns-dao');

module.exports = {
   name: 'executeFork',
   /**
    * @param {TextChannel} channel
    * @param {{forkId: number,
    * forkTreasury: {id: string, name: string},
    * forkToken: {id: string, name: string},
    * forkEndTimestamp: number,
    * tokensInEscrow: number
    * reason: string}} data
    */
   async execute(channel, data) {
      try {
         const embed = generateExecuteForkEmbed(data);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error('events/nouns/executeFork.js: Received error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/customEvents/nouns/executeFork.js: Finished sending executeFork post.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
