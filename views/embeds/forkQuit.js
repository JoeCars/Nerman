const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');

/**
 * @param {{
 * msgSender: {id: string, name: string},
 * tokenIds: number[],
 * }} data
 */
exports.generateForkQuitEmbed = function (data) {
   const title = 'Fork 0 | Quit';

   const quitter = hyperlink(
      data.msgSender.name,
      `https://etherscan.io/address/${data.msgSender.id}`,
   );
   const tokenNumber = inlineCode(data.tokenIds.length);
   const description = `${quitter} quit with ${tokenNumber} token(s).`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return embed;
};
