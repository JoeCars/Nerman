const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const embeds = require('../../../views/embeds/contracts/nouns-fork-token');

module.exports = {
   name: 'nouns-fork-token',

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
            case 'ForkDelegateChanged':
               embed = embeds.generateForkDelegateChangedEmbed(data);
               break;
            case 'ForkNounCreated':
               embed = embeds.generateForkNounCreatedEmbed(data);
               break;
            case 'TransferForkNoun':
               embed = embeds.generateTransferForkNounEmbed(data);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Nouns Fork Token events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(
            `events/nouns/nouns-fork-token.js: Finished sending embed.`,
            {
               eventName: data.eventName,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      } catch (error) {
         Logger.error('events/nouns/nouns-fork-token.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
