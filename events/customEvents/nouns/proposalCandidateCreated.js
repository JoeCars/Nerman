const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateProposalCandidateCreatedEmbed,
} = require('../../../views/embeds/proposalCandidateCreated');

module.exports = {
   name: 'proposalCandidateCreated',
   /**
    * @param {TextChannel} channel
    * @param {{slug: string, msgSender: {id: string, name: string}, description: string}} proposal
    *
    */
   async execute(channel, proposal) {
      try {
         const embed = generateProposalCandidateCreatedEmbed(proposal);
         await channel.send({
            content: null,
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/proposalCandidateCreated.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/proposalCandidateCreated.js: Finished generating proposalCandidateCreated embed.',
         {
            proposalSlug: proposal.slug,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
