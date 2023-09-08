const { MessageEmbed } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

const REASON_LENGTH = 1500;

/**
 * @param {{forkId: number,
 * owner: {name: string, id: string},
 * tokenIds: number[],
 * proposalIds: number[],
 * reason: reason
 * }} data
 *
 */
exports.generateJoinForkEmbed = function (data) {
   const title = `Fork ${data.forkId} Joined!`;

   const url = `https://nouns.wtf/fork/${data.forkId}`;

   const owner = hyperlink(
      data.owner.name,
      `https://etherscan.io/address/${data.owner.id}`,
   );
   const fork = hyperlink(`Fork ${data.forkId}`, url);
   const tokens = inlineCode(data.tokenIds.length);

   let reason = data.reason.trim();
   if (reason.length > REASON_LENGTH) {
      reason = reason.substring(0, REASON_LENGTH).trim() + '...';
   }
   if (reason) {
      reason = '\n\n' + reason;
   }

   const description =
      `${owner} joined ${fork} with ${tokens} tokens.` + reason;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
