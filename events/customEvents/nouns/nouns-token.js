const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const embeds = require('../../../views/embeds/contracts/nouns-token');

module.exports = {
   name: 'nouns-token',

   /**
    * @param {TextChannel} channel
    * @param {{
    *    eventName: string
    * }} data
    */
   async execute(channel, data) {
      try {
         let embed;
         let secondaryEmbed;

         switch (data.eventName) {
            case 'DelegateChanged':
               embed = embeds.generateDelegateChangedEmbed(data, false);
               secondaryEmbed = embeds.generateDelegateChangedEmbed(data, true);
               break;
            case 'NounCreated':
               embed = embeds.generateNounCreatedEmbed(data);
               break;
            case 'Transfer':
               embed = embeds.generateTransferNounEmbed(data);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Nouns Token events.',
               );
         }

         const message = await channel.send({ embeds: [embed] });
         if (secondaryEmbed) {
            await message.edit({ embeds: [secondaryEmbed] });
         }

         Logger.info(`events/nouns/nouns-token.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         Logger.error('events/nouns/nouns-token.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
