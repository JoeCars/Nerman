const { TextChannel } = require('discord.js');

const Logger = require('../../helpers/logger');
const embeds = require('../../views/embeds/contracts/nouns-nymz');

module.exports = {
   name: 'nouns-nymz',

   /**
    * @param {TextChannel} channel
    * @param {{
    *    eventName: string
    * }} data
    */
   async execute(channel, data) {
      try {
         const nouns = channel.client.libraries.get('Nouns');
         let embed;

         switch (data.eventName) {
            case 'New Post':
               embed = await embeds.generateNewPostEmbed(data, nouns);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Nouns Nymz events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(`events/nouns/nouns-nymz.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         Logger.error('events/nouns/nouns-nymz.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
