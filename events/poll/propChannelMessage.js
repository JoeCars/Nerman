const { Message } = require('discord.js');
const PollChannel = require('../../db/schemas/PollChannel');
const propChannelId =
   process.env.DEPLOY_STAGE === 'development'
      ? process.env.DEVNERMAN_NOUNCIL_CHAN_ID
      : process.env.TESTNERMAN_NOUNCIL_CHAN_ID;
const { log: l } = console;

module.exports = {
   name: 'messageCreate',
   /**
    *
    * @param {Message} message
    */
   async execute(message) {
      l({ message });
      const {
         client: {
            user: { id: botId },
         },
         channelId,
         author: { id: authorId },
      } = message;

      const configExists = await PollChannel.configExists(channelId);

      // if (channelId !== propChannelId || botId === authorId) return;
      if (!configExists || botId === authorId) return;

      try {
         await message.delete();
      } catch (error) {
         console.trace('TRACE\n', { error });
      }
   },
};
