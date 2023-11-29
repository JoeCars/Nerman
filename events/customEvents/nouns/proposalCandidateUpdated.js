const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateProposalCandidateUpdatedEmbed,
} = require('../../../views/embeds/contracts/nouns-dao-data');

module.exports = {
   name: 'proposalCandidateUpdated',
   /**
    * @param {TextChannel} channel
    * @param {{slug: string,
    * msgSender: {id: string, name: string},
    * reason: string}} data
    *
    */
   async execute(channel, data) {
      try {
         const embed = generateProposalCandidateUpdatedEmbed(data);
         await channel.send({
            content: null,
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/proposalCandidateUpdated.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/proposalCandidateUpdated.js: Finished generating proposalCandidateUpdated embed.',
         {
            proposalSlug: data.slug,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
