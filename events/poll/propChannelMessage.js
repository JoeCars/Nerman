const { Message } = require('discord.js');
const PollChannel = require('../../db/schemas/PollChannel');
const propChannelId =
   process.env.DEPLOY_STAGE === 'development'
      ? process.env.DEVNERMAN_NOUNCIL_CHAN_ID
      : process.env.TESTNERMAN_NOUNCIL_CHAN_ID;

const Logger = require('../../helpers/logger');

const nermanIds = process.env.NERMAN_BOT_IDS.split(',');

module.exports = {
   name: 'messageCreate',
   /**
    *
    * @param {Message} message
    */
   async execute(message) {
      Logger.info(
         'events/poll/propChannelMessage.js: Attempting to delete invalid messages in the proposal channel.',
         {
            authorId: message.author.id,
            channelId: message.channelId,
            guildId: message.guildId,
            messageId: message.id,
         }
      );

      const {
         client,
         client: {
            user,
            user: { id: botId },
         },
         channelId,
         author: { id: authorId },
      } = message;

      const configExists = await PollChannel.configExists(channelId);

      // if (channelId !== propChannelId || botId === authorId) return;
      if (!configExists || nermanIds.includes(botId)) {
      // if (!configExists || botId === authorId) {
         // Logger.info(
         //    'events/poll/propChannelMessage.js: Message was not invalid, so it was not deleted.',
         //    {
         //       authorId: message.author.id,
         //       channelId: message.channelId,
         //       guildId: message.guildId,
         //       messageId: message.id,
         //    }
         // );
         return;
      }

      try {
         await message.delete();
         Logger.info(
            'events/poll/propChannelMessage.js: Successfully deleted invalid messages in the proposal channel.',
            {
               authorId: message.author.id,
               channelId: message.channelId,
               guildId: message.guildId,
               messageId: message.id,
            }
         );
      } catch (error) {
         Logger.info('events/poll/propChannelMessage.js: Received error.', {
            error: error,
         });
      }
   },
};
