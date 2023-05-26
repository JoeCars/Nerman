const PollChannel = require('../../../db/schemas/PollChannel');
// const PollChannel = require('../../db/schemas/PollChannel');
const Poll = require('../../../db/schemas/Poll');

const { log: l, time: t, timeEnd: te } = console;

module.exports = {
   name: 'messageDelete',
   async execute(message) {
      const {
         client,
         channelId,

         id: messageId,
         author: { bot },
         guild: { id: guildId },
      } = message;

      l({ message });
      l({ bot });

      if (bot === false) return;

      l(!(await PollChannel.configExists(channelId)));
      l(!(await Poll.countDocuments({ messageId })));

      l(
         !(await PollChannel.configExists(channelId)) ||
            !(await Poll.countDocuments({ messageId }))
      );

      if (
         !(await PollChannel.configExists(channelId)) ||
         !(await Poll.countDocuments({ messageId }))
      )
         return;

      // todo Later on I should maybe make a new version of this that actually rebuilds the message if it's deleted, rather than simply closing the poll in the DB
      // const messagePoll = await Poll.findOneAndDelete({ messageId });
      const messagePoll = await Poll.findOneAndUpdate(
         { messageId, guildId },
         { status: 'closed' }
      );

      l({ messagePoll });

      l(await Poll.countDocuments({ messageId }));

      client.emit('dequeuePoll', messagePoll);
   },
};
