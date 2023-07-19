const { Channel } = require('discord.js');

const Logger = require('../../../helpers/logger.js');
const {
   generateNounCreatedEmbed,
} = require('../../../views/embeds/nounCreated.js');

module.exports = {
   name: 'nounCreated',
   /**
    *
    * @param {Channel} nogglesChannel
    */
   async execute(nogglesChannel, data) {
      Logger.info('events/nouns/nounCreated.js: Sending Noun Created embed.', {
         nounId: data.id,
      });

      try {
         const ncEmbed = generateNounCreatedEmbed(data);
         await nogglesChannel.send({ embeds: [ncEmbed] });
      } catch (error) {
         return Logger.error('events/nouns/nounCreated.js: Received error.', {
            error: error,
         });
      }

      Logger.info('events/nouns/nounCreated.js: Finished Noun Created embed.', {
         nounId: data.id,
      });
   },
};
