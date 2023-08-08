const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const { findPollMessage } = require('../../../helpers/poll/thread');
const {
   generateThreadStatusEmbed,
} = require('../../../views/embeds/threadStatusChange');

module.exports = {
   name: 'threadStatusChange',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      try {
         const pollMessage = await findPollMessage(channel, data.id);
         if (!pollMessage) {
            return;
         }
         const threadEmbed = generateThreadStatusEmbed(data.status);
         await pollMessage.thread.send({
            content: null,
            embeds: [threadEmbed],
         });
      } catch (error) {
         return Logger.error(
            'events/poll/threadStatusChange.js: Received error.',
            {
               error: error,
               guildId: channel.guildId,
               channelId: channel.id,
            },
         );
      }

      Logger.info(
         'events/poll/threadStatusChange.js: Finished sending thread status update.',
         {
            guildId: channel.guildId,
            channelId: channel.id,
         },
      );
   },
};
