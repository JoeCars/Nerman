const { TextChannel } = require('discord.js');

const {
   generateForkAuctionBidEmbed,
} = require('../../../views/embeds/contracts/nouns-fork-auction-house');
const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'forkAuctionBid',
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
         const bidEmbed = generateForkAuctionBidEmbed(data);
         await channel.send({ embeds: [bidEmbed] });
      } catch (error) {
         return Logger.error(
            'events/nouns/forkAuctionBid.js: Received error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/customEvents/nouns/forkAuctionBid.js: Handled forkAuctionBid event.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
