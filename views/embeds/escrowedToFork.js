const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode, italic } = require('@discordjs/builders');

const PROPOSAL_REASON_LENGTH = 1500;

/**
 * @param {{forkId: number,
 * owner: {id: string, name: string},
 * tokenIds: number[],
 * reason: string,
 * currentEscrowAmount: number,
 * totalSupply: number,
 * thresholdNumber, number,
 * currentPercentage: number
 * }} data
 */
exports.generateEscrowedToForkEmbed = function (data) {
   const title = `Tokens Escrowed To Fork ${data.forkId}!`;

   const owner = hyperlink(
      data.owner.name,
      `https://etherscan.io/address/${data.owner.id}`,
   );
   const tokenNumber = inlineCode(data.tokenIds.length);
   const escrowDescription = `${owner} escrowed ${tokenNumber} token(s).`;

   const status = italic(`\n\n${data.currentEscrowAmount} in escrow, ${data.currentPercentage}% of fork threshold.`);

   let escrowReason = '';
   if (data.reason.trim()) {
      escrowReason = '\n\n' + data.reason.trim();
   }
   if (escrowReason.length > PROPOSAL_REASON_LENGTH) {
      escrowReason =
         '\n\n' +
         escrowReason.substring(0, PROPOSAL_REASON_LENGTH).trim() +
         '...';
   }
   const description = escrowDescription + status + escrowReason;

   const url = `https://nouns.wtf/fork/${data.forkId}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
