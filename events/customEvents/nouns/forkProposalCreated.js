const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateForkProposalCreatedEmbed,
} = require('../../../views/embeds/contracts/nouns-fork');

module.exports = {
   name: 'forkProposalCreated',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, proposal) {
      try {
         const embed = generateForkProposalCreatedEmbed(proposal);
         await channel.send({
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/forkProposalCreated.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/forkProposalCreated.js: Finished generating forkProposalCreated embed.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
