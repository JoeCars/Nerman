const { MessageEmbed } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');
const { getNounsLink, getEthAmount } = require('../helpers');

/**
 * @param {{
 *    id: string,
 *    bidder: {id: string, name: string},
 *    amount: BigNumber,
 *    extended: any
 * }} data
 */
exports.generateAuctionBidEmbed = function (data) {
   const bidderLink = hyperlink(
      data.bidder.name,
      `https://etherscan.io/address/${data.bidder.id}`,
   );
   const nounsLink = getNounsLink(data.id);
   const amount = getEthAmount(data.amount);

   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(`Auction Bid`)
      .setDescription(`${bidderLink} bid ${amount}Ξ on ${nounsLink}`);
};
