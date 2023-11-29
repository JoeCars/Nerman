const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateEscrowedToForkEmbed,
} = require('../../../views/embeds/contracts/nouns-dao');

module.exports = {
   name: 'escrowedToFork',
   /**
    * @param {TextChannel} channel
    * @param {{forkId: number,
    * owner: {id: string, name: string},
    * tokenIds: number[],
    * reason: string,
    * currentEscrowAmount: number,
    * totalSupply: number,
    * thresholdNumber, number,
    * currentPercentage: number
    * }} data
    */
   async execute(channel, data) {
      try {
         const embed = generateEscrowedToForkEmbed(data);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/nouns/escrowedToFork.js: Received error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/customEvents/nouns/escrowedToFork.js: Finished sending escrowedToFork post.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
