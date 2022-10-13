const { Message } = require('discord.js');
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
      const {
         client: {
            user: { id: botId },
         },
         channelId,
         author: { id: authorId },
      } = message;

      l({ message });

      if (channelId !== propChannelId || botId === authorId) return;

      try {
         await message.delete();
      } catch (error) {
         console.error('ERROR\n', { error });
         console.info('INFO\n', { error });
         console.trace('TRACE\n', { error });
      }
   },
};
