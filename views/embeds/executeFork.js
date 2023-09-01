const { MessageEmbed } = require('discord.js');

/**
 * @param {{forkId: number,
 * forkTreasury: {id: string, name: string},
 * forkToken: {id: string, name: string},
 * forkEndTimestamp: number,
 * tokensInEscrow: number
 * reason: string}} data
 */
exports.generateExecuteForkEmbed = function (data) {
   const title = `Fork ${data.forkId} Executed!`;

   const description = `Fork ${data.forkId} executed with ${data.tokensInEscrow} tokens!`;

   const url = `https://nouns.wtf/fork/${data.forkId}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
