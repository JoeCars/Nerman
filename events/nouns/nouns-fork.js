const { TextChannel } = require('discord.js');

const Logger = require('../../helpers/logger');
const embeds = require('../../views/embeds/contracts/nouns-fork');

module.exports = {
   name: 'nouns-fork',

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
            case 'ForkProposalCreated':
               embed = embeds.generateForkProposalCreatedEmbed(data);
               break;
            case 'ForkProposalStatusChange':
               embed = embeds.generateForkProposalStatusChangeEmbed(data);
               break;
            case 'ForkQuit':
               embed = embeds.generateForkQuitEmbed(data);
               break;
            case 'ForkVoteCast':
               embed = embeds.generateForkVoteCastEmbed(data);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Nouns Fork events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(`events/nouns/nouns-fork.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         Logger.error('events/nouns/nouns-fork.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
