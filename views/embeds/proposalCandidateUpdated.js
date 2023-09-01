const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');

/**
 * @param {{slug: string,
 * msgSender: {id: string, name: string},
 * reason: string}} proposal
 */
exports.generateProposalCandidateUpdatedEmbed = function (proposal) {
   const title = `Proposal Candidate Updated`;

   const proposer = hyperlink(
      proposal.msgSender.name,
      `https://etherscan.io/address/${proposal.msgSender.id}`,
   );
   const proposalTitle = proposal.slug
      .trim()
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1).toLowerCase();
      })
      .join(' ');
   const proposalUrl = `https://nouns.wtf/candidates/${proposal.msgSender.id.toLowerCase()}-${
      proposal.slug
   }`;
   const proposalName = hyperlink(proposalTitle, proposalUrl);
   const reason = proposal.reason ? `\n\n${proposal.reason}` : '';
   const description = `${proposer} has ${inlineCode(
      'UPDATED',
   )} their proposal candidate (${proposalName}).${reason}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return embed;
};
