const { TextChannel } = require('discord.js');

const { generateAuctionBidEmbed } = require('../../../views/embeds/auctionBid');
const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'auctionBid',
   /**
    *
    * @param {TextChannel} auctionChannel
    */
   async execute(auctionChannel, data) {
      if (!auctionChannel || !data) {
         return Logger.error('Invalid arguments passed to auction bid.', {
            auctionChannel: auctionChannel,
            data: data,
            error: new Error('Arguments not defined.'),
         });
      }

      Logger.info(
         'events/customEvents/nouns/auctionBid.js: Printing an auction bid.',
         {
            id: `${data.id}`,
            amount: `${data.amount}`,
            bidderId: `${data.bidder.id}`,
         },
      );

      try {
         const Nouns = auctionChannel.client.libraries.get('Nouns');
         const bidEmbed = await generateAuctionBidEmbed(Nouns, data);
         await auctionChannel.send({ embeds: [bidEmbed] });
      } catch (error) {
         Logger.error('Unable to generate bid embed.', {
            error: error,
         });
      }

      Logger.info(
         'events/customEvents/nouns/auctionBid.js: Finished printing an auction bid.',
         {
            id: `${data.id}`,
            amount: `${data.amount}`,
            bidderId: `${data.bidder.id}`,
         },
      );
   },
};
