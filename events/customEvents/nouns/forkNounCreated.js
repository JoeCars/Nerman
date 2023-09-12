const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger.js');
const {
   generateNounCreatedEmbed,
} = require('../../../views/embeds/nounCreated.js');

module.exports = {
   name: 'forkNounCreated',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      try {
         const embed = generateNounCreatedEmbed(data);
         embed.title = 'Fork 0 | ' + embed.title;
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/nouns/forkNounCreated.js: Received error.',
            {
               error: error,
               guildId: channel.guildId,
               channelId: channel.id,
            },
         );
      }

      Logger.info(
         'events/nouns/forkNounCreated.js: Finished Noun Created embed.',
         {
            guildId: channel.guildId,
            channelId: channel.id,
         },
      );
   },
};
