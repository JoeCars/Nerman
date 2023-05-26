const PollChannel = require('../../../db/schemas/PollChannel');
const Poll = require('../../../db/schemas/Poll');
const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'messageDelete',
   async execute(message) {
      Logger.info(
         'events/poll/pollMessageDelete.js: Attempting to delete poll.',
         {
            channelId: message.channelId,
            guildId: message.guild.id,
            messageId: message.id,
         }
      );

      const {
         client,
         channelId,

         id: messageId,
         author: { bot },
         guild: { id: guildId },
      } = message;

      if (bot === false) return;

      if (
         !(await PollChannel.configExists(channelId)) ||
         !(await Poll.countDocuments({ messageId }))
      ) {
         Logger.info(
            'events/poll/pollMessageDelete.js: The message was not a valid poll.',
            {
               channelId: message.channelId,
               guildId: message.guild.id,
               messageId: message.id,
            }
         );
         return;
      }

      // todo Later on I should maybe make a new version of this that actually rebuilds the message if it's deleted, rather than simply closing the poll in the DB
      // const messagePoll = await Poll.findOneAndDelete({ messageId });
      const messagePoll = await Poll.findOneAndUpdate(
         { messageId, guildId },
         { status: 'closed' }
      );

      client.emit('dequeuePoll', messagePoll);

      Logger.info('events/poll/pollMessageDelete.js: Finished deleting poll.', {
         channelId: message.channelId,
         guildId: message.guild.id,
         messageId: message.id,
      });
   },
};
