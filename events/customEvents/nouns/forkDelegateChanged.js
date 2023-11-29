const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateDelegateChangedEmbed,
} = require('../../../views/embeds/contracts/nouns-token');

module.exports = {
   name: 'forkDelegateChanged',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      const embed = generateDelegateChangedEmbed(data);
      embed.title = 'Fork 0 | ' + embed.title;

      try {
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/nouns/forkDelegateChanged.js: Received error.',
            { error: error, channelId: channel.id, guildId: channel.guildId },
         );
      }

      Logger.info(
         'events/nouns/forkDelegateChanged.js: Finished sending delegate change notification.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
