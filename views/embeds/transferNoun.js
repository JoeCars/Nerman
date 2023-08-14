const { MessageEmbed } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const DEFAULT_MINT_ID = '0x0000000000000000000000000000000000000000';

/**
 *
 * @param {{
 *    from: {id: string, name: string},
 *    to: {id: string, name: string},
 *    tokenId: string}} data
 * @param {boolean} hasMarkdown
 */
exports.generateTransferNounEmbed = function (data, hasMarkdown = true) {
   let title = `Transfer | Noun ${data.tokenId}`;
   if (data.from.id === data.to.id) {
      title = `Stanky Shameless Washing | Noun ${data.tokenId}`;
   } else if (data.from.id === DEFAULT_MINT_ID) {
      title = `Mint | Noun ${data.tokenId}`;
   }

   let fromWallet = data.from.name;
   let toWallet = data.to.name;
   if (hasMarkdown) {
      fromWallet = hyperlink(
         fromWallet,
         `https://etherscan.io/address/${data.from.id}`,
      );
      toWallet = hyperlink(
         toWallet,
         `https://etherscan.io/address/${data.to.id}`,
      );
   }
   const description = `From ${fromWallet} to ${toWallet}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setImage(`http://noun.pics/${data.tokenId}.png`);
   return embed;
};
