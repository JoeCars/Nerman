const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateForkProposalStatusChangeEmbed,
} = require('../../../views/embeds/contracts/nouns-fork');

module.exports = {
   name: 'forkProposalStatusChange',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      try {
         const statusEmbed = await generateForkProposalStatusChangeEmbed(data);
         await channel.send({
            embeds: [statusEmbed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/forkProposalStatusChange.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/forkProposalStatusChange.js: Finished generating forkProposalStatusChange embed.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
