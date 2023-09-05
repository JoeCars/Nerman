const { MessageEmbed } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

/**
 * @param {{forkId: number,
 * forkTreasury: {id: string, name: string},
 * forkToken: {id: string, name: string},
 * forkEndTimestamp: number,
 * tokensInEscrow: number
 * reason: string}} data
 */
exports.generateExecuteForkEmbed = function (data) {
   const title = `Fork Executed!`;

   const url = `https://nouns.wtf/fork/${data.forkId}`;

   const forkName = hyperlink(`Fork ${data.forkId}`, url);

   const description = `${forkName} executed with ${inlineCode(
      data.tokensInEscrow,
   )} tokens!`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
