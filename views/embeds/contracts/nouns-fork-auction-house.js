const { MessageEmbed } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');
const { getEthAmount } = require('../../helpers');

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

// TODO: Update image if the new nouns look different.
exports.generateForkAuctionCreatedEmbed = function (data) {
   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(`Fork 0 | New Auction | Noun ${data.id}`)
      .setImage(`http://noun.pics/${data.id}.png`);

   return embed;
};
