const { TextChannel } = require('discord.js');

const Logger = require('../../helpers/logger');
const embeds = require('../../views/embeds/contracts/lil-nouns');

module.exports = {
   name: 'lil-nouns',

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
            case 'LilNounsAuctionBid':
               embed = embeds.generateAuctionBidEmbed(data);
               break;
            case 'LilNounsAuctionCreated':
               embed = embeds.generateAuctionCreatedEmbed(data);
               break;
            case 'LilNounsProposalCreated':
               embed = embeds.generateProposalCreatedEmbed(data);
               break;
            case 'LilNounsProposalStatusChange':
               embed = embeds.generateProposalStatusChangeEmbed(data);
               break;
            case 'LilNounsVoteCast':
               embed = embeds.generateVoteCastEmbed(data, true);
               break;
            case 'LilNounsTransfer':
               embed = embeds.generateTransferEmbed(data, true);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported LilNouns events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(`events/nouns/lil-nouns.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         Logger.error('events/nouns/lil-nouns.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
