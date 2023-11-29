const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger.js');
const {
   generateNounCreatedEmbed,
} = require('../../../views/embeds/contracts/nouns-token');

module.exports = {
   name: 'nounCreated',
   /**
    *
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      try {
         const ncEmbed = generateNounCreatedEmbed(data);
         await channel.send({ embeds: [ncEmbed] });
      } catch (error) {
         return Logger.error('events/nouns/nounCreated.js: Received error.', {
            error: error,
            guildId: channel.guildId,
            channelId: channel.id,
         });
      }

      Logger.info('events/nouns/nounCreated.js: Finished Noun Created embed.', {
         nounId: data.id,
         guildId: channel.guildId,
         channelId: channel.id,
      });
   },
};
