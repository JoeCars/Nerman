const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const { generateForkQuitEmbed } = require('../../../views/embeds/forkQuit');

module.exports = {
   name: 'forkQuit',
   /**
    * @param {TextChannel} channel
    * @param {{
    * msgSender: {id: string, name: string},
    * tokenIds: number[],
    * }} data
    */
   async execute(channel, data) {
      try {
         const embed = generateForkQuitEmbed(data);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error('events/nouns/forkQuit.js: Received error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/customEvents/nouns/forkQuit.js: Finished sending forkQuit post.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
