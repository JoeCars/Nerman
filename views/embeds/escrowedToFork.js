const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');

const PROPOSAL_REASON_LENGTH = 1500;

/**
 * @param {{forkId: number,
 * owner: {id: string, name: string},
 * tokenIds: number[],
 * reason: string}} data
 */
exports.generateEscrowedToForkEmbed = function (data) {
   const title = `Tokens Escrowed To Fork ${data.forkId}!`;

   const owner = hyperlink(
      data.owner.name,
      `https://etherscan.io/address/${data.owner.id}`,
   );
   const tokenNumber = inlineCode(data.tokenIds.length);
   const proposalDescription = `${owner} escrowed ${tokenNumber} token(s).`;
   let proposalReason = '';
   if (data.reason.trim()) {
      proposalReason = '\n\n' + data.reason.trim();
   }
   if (proposalReason.length > PROPOSAL_REASON_LENGTH) {
      proposalReason =
         '\n\n' +
         proposalReason.substring(0, PROPOSAL_REASON_LENGTH).trim() +
         '...';
   }
   const description = proposalDescription + proposalReason;

   const url = `https://nouns.wtf/fork/${data.forkId}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
