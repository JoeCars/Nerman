const { MessageEmbed } = require('discord.js');
const { findAccountLink, getNounsLink, getEthAmount } = require('../helpers');

/**
 *
 * @param {*} Nouns
 * @param {{amount: BigNumber, bidder: {id: any}, id: any}} bidData
 * @returns {MessageEmbed}
 */
exports.generateAuctionBidEmbed = async function generateAuctionBidEmbed(
   Nouns,
   bidData,
) {
   const bidderLink = await findAccountLink(Nouns, bidData.bidder.id);
   const nounsLink = getNounsLink(bidData.id);
   const amount = getEthAmount(bidData.amount);

   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(`Auction Bid`)
      .setDescription(`${bidderLink} bid ${amount}Ξ on ${nounsLink}`);
};
