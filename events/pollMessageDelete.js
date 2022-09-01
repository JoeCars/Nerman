const PollChannel = require('../db/schemas/PollChannel');
const Poll = require('../db/schemas/Poll');

const { log: l, time: t, timeEnd: te } = console;

module.exports = {
   name: 'messageDelete',
   async execute(message) {
      const { channelId, id: messageId } = message;

      if (
         !PollChannel.countDocuments({ channelId }) ||
         !Poll.countDocuments({ messageId })
      )
         return;

      const messagePoll = await Poll.findOneAndDelete({ messageId });

      l({ messagePoll });

      l(await Poll.countDocuments({ messageId }));
   },
};
