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
   const proposalTitle =
      proposal.slug
         .trim()
         .split('-', 3)
         .filter(word => {
            return word.trim();
         })
         .map(word => {
            return word[0].toUpperCase() + word.substring(1).toLowerCase();
         }) + +'...';
   const proposalUrl = `https://nouns.wtf/candidates/${proposal.msgSender.id}-${proposal.slug}`;
   const proposalName = hyperlink(proposalTitle, proposalUrl);
   const description = `${proposer} has ${inlineCode(
      'UPDATED',
   )} their proposal candidate (${proposalName}).`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return embed;
};
