const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateCandidateFeedbackSentEmbed,
} = require('../../../views/embeds/candidateFeedbackSent');

module.exports = {
   name: 'candidateFeedbackSent',
   /**
    * @param {TextChannel} channel
    * @param {{slug: string,
    * msgSender: {id: string, name: string},
    * proposer: {id: string, name: string},
    * supportVote: string,
    * reason: string}} data
    *
    */
   async execute(channel, data) {
      try {
         const embed = generateCandidateFeedbackSentEmbed(data);
         await channel.send({
            content: null,
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/candidateFeedbackSent.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/candidateFeedbackSent.js: Finished generating candidateFeedbackSent embed.',
         {
            proposalSlug: data.slug,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
