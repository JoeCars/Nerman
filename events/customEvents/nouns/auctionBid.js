const { TextChannel } = require('discord.js');

const { generateAuctionBidEmbed } = require('../../../views/embeds/auctionBid');
const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'auctionBid',
   /**
    *
    * @param {TextChannel} channel
    * @param {{
    *    id: string,
    *    bidder: {id: string, name: string},
    *    amount: BigNumber,
    *    extended: any
    * }} data
    */
   async execute(channel, data) {
      try {
         const bidEmbed = generateAuctionBidEmbed(data);
         await channel.send({ embeds: [bidEmbed] });
      } catch (error) {
         return Logger.error('events/nouns/auctionBid.js: Received error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/customEvents/nouns/auctionBid.js: Finished printing an auction bid.',
         {
            id: `${data.id}`,
            amount: `${data.amount}`,
            bidderId: `${data.bidder.id}`,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
