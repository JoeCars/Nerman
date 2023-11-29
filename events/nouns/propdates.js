const { TextChannel } = require('discord.js');

const embeds = require('../../views/embeds/contracts/propdates');
const Logger = require('../../helpers/logger');

module.exports = {
   name: 'propdates',

   /**
    * @param {TextChannel} channel
    * @param {{
    *    eventName: string
    * }} data
    */
   async execute(channel, data) {
      try {
         let embed;

         switch (data.eventName) {
            case 'PostUpdate':
               embed = embeds.generatePostUpdateEmbed(data);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Propdates events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(`events/nouns/propdates.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         Logger.error('events/nouns/propdates.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
