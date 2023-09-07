const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateWithdrawNounsFromEscrowEmbed,
} = require('../../../views/embeds/withdrawNounsFromEscrow');

module.exports = {
   name: 'withdrawNounsFromEscrow',
   /**
    * @param {TextChannel} channel
    * @param {{tokenIds: number[],
    * to: {id: string, name: string}}} data
    */
   async execute(channel, data) {
      try {
         const embed = generateWithdrawNounsFromEscrowEmbed(data);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/nouns/withdrawNounsFromEscrow.js: Received error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/customEvents/nouns/withdrawNounsFromEscrow.js: Finished sending withdrawNounsFromEscrow post.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
