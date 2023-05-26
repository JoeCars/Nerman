const { Message } = require('discord.js');
const PollChannel = require('../../../db/schemas/PollChannel');
const propChannelId =
   process.env.DEPLOY_STAGE === 'development'
      ? process.env.DEVNERMAN_NOUNCIL_CHAN_ID
      : process.env.TESTNERMAN_NOUNCIL_CHAN_ID;
const { log: l } = console;
const { lc } = require('../../../utils/functions');

module.exports = {
   name: 'messageCreate',
   /**
    *
    * @param {Message} message
    */
   async execute(message) {
      l({ message });
      l('message.interaction => ', message.interaction);
      const {
         client,
         client: {
            user,
            user: { id: botId },
         },
         channelId,
         channel,
         author: { id: authorId },
      } = message;

      lc('client', '79', client);
      lc('user', '85', user);

      const configExists = await PollChannel.configExists(channelId);

      // if (channelId !== propChannelId || botId === authorId) return;
      if (!configExists || botId === authorId) return;

      try {
         message.delete();
      } catch (error) {
         console.trace('TRACE\n', { error });
      }
   },
};
