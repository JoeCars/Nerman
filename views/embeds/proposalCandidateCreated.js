const { MessageEmbed } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

/**
 * @param {{slug: string, msgSender: {id: string, name: string}, description: string}} proposal
 */
exports.generateProposalCandidateCreatedEmbed = function (proposal) {
   const titleEndIndex = proposal.description.indexOf('\n');
   let proposalTitle = proposal.description.substring(1, titleEndIndex).trim();
   if (proposalTitle.length > 150) {
      proposalTitle = proposalTitle.substring(0, 150) + '...';
   }
   const title = `Candidate Proposal Created: ${proposalTitle}`;

   const proposalDescription = proposal.description.substring(titleEndIndex).trim() + "...";
   const proposer = hyperlink(proposal.msgSender.name, `https://etherscan.io/address/${proposal.msgSender.id}`);
   const description = `${proposalDescription}\n\n—${proposer}`;

   const url = `https://nouns.wtf/candidates/${proposal.msgSender.id}-${proposal.slug}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
