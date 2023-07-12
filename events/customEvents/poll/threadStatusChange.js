const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const { findPollMessage } = require('../../../helpers/poll/thread');
const {
   generateThreadStatusEmbed,
} = require('../../../views/embeds/threadStatusChange');

module.exports = {
   name: 'threadStatusChange',
   /**
    * @param {TextChannel} interaction
    */
   async execute(channel, data) {
      Logger.info(
         'events/customEvents/poll/threadStatusChange.js: Updating status in poll thread.',
         {
            proposalId: `${data.id}`,
            status: data.status,
         },
      );

      const pollMessage = await findPollMessage(channel, data.id);

      if (!pollMessage) {
         return;
      }

      const threadEmbed = generateThreadStatusEmbed(data.status);

      await pollMessage.thread.send({
         content: null,
         embeds: [threadEmbed],
      });
   },
};
