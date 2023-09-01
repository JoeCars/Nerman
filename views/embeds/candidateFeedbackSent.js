const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');

const PROPOSAL_REASON_LENGTH = 1500;
const DISCORD_TITLE_LIMIT = 250; // Actually 256 but leaving space for ellipses.

/**
 * @param {TextChannel} channel
 * @param {{slug: string,
 * msgSender: {id: string, name: string},
 * proposer: {id: string, name: string},
 * supportVote: string,
 * reason: string}} data
 *
 */
exports.generateCandidateFeedbackSentEmbed = function (data) {
   const proposalTitle = data.slug
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');
   let title = `New Candidate Feedback | ${proposalTitle}`;
   if (title.length > DISCORD_TITLE_LIMIT) {
      title = title.substring(0, DISCORD_TITLE_LIMIT) + '...';
   }

   const feedbacker = hyperlink(
      data.msgSender.name,
      `https://etherscan.io/address/${data.msgSender.id}`,
   );
   const proposalDescription = `${feedbacker}'s current sentiment: ${inlineCode(
      data.supportVote,
   )}.`;
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

   const url = `https://nouns.wtf/candidates/${data.proposer.id.toLowerCase()}-${
      data.slug
   }`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
