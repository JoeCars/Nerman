const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateFeedbackSentEmbed,
} = require('../../../views/embeds/feedbackSent');

module.exports = {
   name: 'feedbackSent',
   /**
    * @param {TextChannel} channel
    * @param {{proposalId: number,
    * msgSender: {id: string, name: string},
    * supportVote: string,
    * reason: string}} data
    *
    */
   async execute(channel, data) {
      try {
         const embed = generateFeedbackSentEmbed(data);
         await channel.send({
            content: null,
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/feedbackSent.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/feedbackSent.js: Finished generating feedbackSent embed.',
         {
            proposalId: data.proposalId,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
