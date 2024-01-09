const { TextChannel } = require('discord.js');

const Logger = require('../../helpers/logger');
const embeds = require('../../views/embeds/contracts/farcaster');

module.exports = {
   name: 'farcaster',

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
            case 'NounsCast':
               embed = embeds.generateNounsCastEmbed(data);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(`events/nouns/farcaster.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         Logger.error('events/nouns/farcaster.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
