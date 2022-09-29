const PollChannel = require('../db/schemas/PollChannel');
const Poll = require('../db/schemas/Poll');

const { log: l, time: t, timeEnd: te } = console;

module.exports = {
   name: 'messageDelete',
   async execute(message) {
      const {
         client,
         channelId,
         author: { bot },
         id: messageId,
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

      // const messagePoll = await Poll.findOneAndDelete({ messageId });
      const messagePoll = await Poll.findOneAndUpdate(
         { messageId },
         { status: 'closed' }
      );

      l({ messagePoll });

      l(await Poll.countDocuments({ messageId }));

      client.emit('dequeuePoll', messagePoll);
   },
};
