const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateProposalCandidateCanceledEmbed,
} = require('../../../views/embeds/contracts/nouns-dao-data');

module.exports = {
   name: 'proposalCandidateCanceled',
   /**
    * @param {TextChannel} channel
    * @param {{slug: string,
    * msgSender: {id: string, name: string},
    * reason: string}} data
    *
    */
   async execute(channel, data) {
      try {
         const embed = generateProposalCandidateCanceledEmbed(data);
         await channel.send({
            content: null,
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/proposalCandidateCanceled.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/proposalCandidateCanceled.js: Finished generating proposalCandidateCanceled embed.',
         {
            proposalSlug: data.slug,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
