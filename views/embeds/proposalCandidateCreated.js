const { MessageEmbed } = require('discord.js');
const { hyperlink, codeBlock } = require('@discordjs/builders');

const PROPOSAL_DESCRIPTION_LENGTH = 150;
const DISCORD_TITLE_LIMIT = 250; // Actually 256 but leaving space for ellipses.

/**
 * @param {{slug: string, msgSender: {id: string, name: string}, description: string}} proposal
 */
exports.generateProposalCandidateCreatedEmbed = function (proposal) {
   const proposalTitle = proposal.slug
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');
   let title = `New Proposal Candidate: ${proposalTitle}`;
   if (title.length > DISCORD_TITLE_LIMIT) {
      title = title.substring(0, DISCORD_TITLE_LIMIT) + '...';
   }

   const proposer = hyperlink(
      proposal.msgSender.name,
      `https://etherscan.io/address/${proposal.msgSender.id}`,
   );
   const description = `Proposed by ${proposer}`;

   const url = `https://nouns.wtf/candidates/${proposal.msgSender.id.toLowerCase()}-${
      proposal.slug
   }`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
