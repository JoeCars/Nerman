const { MessageEmbed } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

/**
 * @param {{tokenIds: number[],
 * to: {id: string, name: string}}} data
 */
exports.generateWithdrawNounsFromEscrowEmbed = function (data) {
   const title = `Nouns Withdrawn From Escrow!`;

   const withdrawer = hyperlink(
      data.to.name,
      `https://etherscan.io/address/${data.to.id}`,
   );
   const nounsWithdrawn = inlineCode(data.tokenIds.length);

   const description = `${withdrawer} withdrew ${nounsWithdrawn} tokens from escrow.`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return embed;
};
