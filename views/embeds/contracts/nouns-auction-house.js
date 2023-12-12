const { EmbedBuilder } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');
const { getNounsLink, getEthAmount } = require('../../helpers');

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

   return new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(`Auction Bid`)
      .setDescription(`${bidderLink} bid ${amount}Ξ on ${nounsLink}`);
};

exports.generateAuctionCreatedEmbed = function (data) {
   const nounsWTF = hyperlink('Nouns.wtf', `https://nouns.wtf/noun/${data.id}`);
   const pronouns = hyperlink(
      'Pronouns.gg',
      `https://pronouns.gg/noun/${data.id}`,
   );
   const nounOClock = hyperlink(
      'Nounoclock.app',
      `https://www.nounoclock.app/`,
   );

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(`New Auction | Noun ${data.id}`)
      .setDescription(`${nounsWTF}\n${pronouns}\n${nounOClock}`)
      .setImage(`http://noun.pics/${data.id}.png`);

   return embed;
};

exports.generateAuctionEndEmbed = (data, hasMarkdown = true) => {
   const title = `SOLD! Noun ${data.id} for ${data.amount}Ξ`;
   let bidder = data.bidderName;
   if (hasMarkdown) {
      bidder = hyperlink(
         bidder,
         `https://etherscan.io/address/${data.address}`,
      );
   }
   const description = `Winner: ${bidder}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setImage(`https://noun.pics/${data.id}.png`);

   return embed;
};
