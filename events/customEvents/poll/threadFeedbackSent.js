const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const { findPollMessage } = require('../../../helpers/poll/thread');
const {
   generateFeedbackSentEmbed,
} = require('../../../views/embeds/feedbackSent');
const UrlConfig = require('../../../db/schemas/UrlConfig');

module.exports = {
   name: 'threadFeedbackSent',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      try {
         const pollMessage = await findPollMessage(channel, data.proposalId);
         if (!pollMessage) {
            return;
         }
         const propUrl = (await UrlConfig.fetchUrls(channel.guildId)).propUrl;
         const threadEmbed = generateFeedbackSentEmbed(data, propUrl);
         await pollMessage.thread.send({
            content: null,
            embeds: [threadEmbed],
         });
      } catch (error) {
         return Logger.error(
            'events/poll/threadFeedbackSent.js: Received error.',
            {
               error: error,
               guildId: channel.guildId,
               channelId: channel.id,
            },
         );
      }

      Logger.info(
         'events/poll/threadFeedbackSent.js: Finished sending threadFeedbackSent.',
         {
            guildId: channel.guildId,
            channelId: channel.id,
         },
      );
   },
};
