const { MessageEmbed } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');
const { getEthAmount } = require('../helpers');

/**
 * @param {{
 *    id: string,
 *    bidder: {id: string, name: string},
 *    amount: BigNumber,
 *    extended: any
 * }} data
 */
exports.generateForkAuctionBidEmbed = function (data) {
   const bidderLink = hyperlink(
      data.bidder.name,
      `https://etherscan.io/address/${data.bidder.id}`,
   );
   const amount = getEthAmount(data.amount);

   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(`Fork 0 | Auction Bid`)
      .setDescription(`${bidderLink} bid ${amount}Ξ on Noun ${data.id}`);
};
