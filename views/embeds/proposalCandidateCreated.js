const { MessageEmbed } = require('discord.js');
const { hyperlink, blockQuote } = require('@discordjs/builders');

/**
 * @param {{slug: string, msgSender: {id: string, name: string}, description: string}} proposal
 */
exports.generateProposalCandidateCreatedEmbed = function (proposal) {
   const proposalTitle = proposal.slug
      .split('-', 3)
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');
   const title = `New Proposal Candidate: ${proposalTitle}...`;

   const titleEndIndex = proposal.description.indexOf('\n');
   const proposalDescription =
      proposal.description
         .substring(titleEndIndex, titleEndIndex + 150)
         .trim() + '...';
   const proposer = hyperlink(
      proposal.msgSender.name,
      `https://etherscan.io/address/${proposal.msgSender.id}`,
   );
   const description = `Proposed by ${proposer}\n\n${blockQuote(
      proposalDescription,
   )}`;

   const url = `https://nouns.wtf/candidates/${proposal.msgSender.id}-${proposal.slug}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
