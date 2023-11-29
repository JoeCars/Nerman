const { TextChannel } = require('discord.js');

const Logger = require('../../helpers/logger');
const embeds = require('../../views/embeds/contracts/nouns-auction-house');

module.exports = {
   name: 'nouns-auction-house',

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
            case 'AuctionBid':
               embed = embeds.generateAuctionBidEmbed(data);
               break;
            case 'AuctionCreated':
               embed = embeds.generateAuctionCreatedEmbed(data);
               break;
            case 'AuctionEnd':
               embed = embeds.generateAuctionEndEmbed(data, true);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Nouns Auction House events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(
            `events/nouns/nouns-auction-house.js: Finished sending embed.`,
            {
               eventName: data.eventName,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      } catch (error) {
         Logger.error('events/nouns/nouns-auction-house.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
