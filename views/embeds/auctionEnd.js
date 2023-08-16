const { MessageEmbed } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');
const { getEthAmount } = require('../helpers');

/**
 * @param {{
 *    id: number,
 *    winner: {id: string, name: string}
 *    amount: BigNumber
 * }} data
 */
exports.generateAuctionEndEmbed = (data, hasMarkdown = true) => {
   const title = `SOLD! Noun ${data.id} for ${getEthAmount(data.amount)}Ξ`;
   let bidder = data.winner.name;
   if (hasMarkdown) {
      bidder = hyperlink(
         bidder,
         `https://etherscan.io/address/${data.winner.id}`,
      );
   }
   const description = `Winner: ${bidder}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setImage(`https://noun.pics/${data.id}.png`);

   return embed;
};
