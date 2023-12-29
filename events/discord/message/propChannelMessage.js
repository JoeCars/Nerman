const { Message } = require('discord.js');
const PollChannel = require('../../../db/schemas/PollChannel');

const Logger = require('../../../helpers/logger');

const nermanIds = process.env.NERMAN_BOT_IDS.split(',');

module.exports = {
   name: 'messageCreate',
   /**
    * @param {Message} message
    */
   async execute(message) {
      const {
         channelId,
         author: { id: authorId },
      } = message;

      const configExists = await PollChannel.configExists(channelId);

      if (!configExists || nermanIds.includes(authorId)) {
         return;
      }

      try {
         await message.delete();
         Logger.info(
            'events/poll/propChannelMessage.js: Deleted invalid messages in the proposal channel.',
            {
               authorId: message.author.id,
               channelId: message.channelId,
               guildId: message.guildId,
               messageId: message.id,
            },
         );
      } catch (error) {
         Logger.info('events/poll/propChannelMessage.js: Received error.', {
            error: error,
            channelId: message.channelId,
            guildId: message.guildId,
         });
      }
   },
};
