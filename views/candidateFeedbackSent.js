const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');

const PROPOSAL_REASON_LENGTH = 150;

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
      .split('-', 3)
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');
   const title = `New Candidate Feedback | ${proposalTitle}...`;

   const proposer = hyperlink(
      data.proposer.name,
      `https://etherscan.io/address/${data.proposer.id}`,
   );
   const feedbacker = hyperlink(
      data.msgSender.name,
      `https://etherscan.io/address/${data.msgSender.id}`,
   );
   const proposalDescription = `${feedbacker} left feedback on ${proposer}'s candidate proposal.\n\n`;
   let proposalReason = '';
   if (data.reason.trim()) {
      proposalReason = data.reason.trim();
   }
   if (proposalReason.length > PROPOSAL_REASON_LENGTH) {
      proposalReason =
         proposalReason.substring(0, PROPOSAL_REASON_LENGTH).trim() + '...';
   }
   if (proposalReason) {
      proposalReason += '\n\n';
   }
   const proposalSentiment = `Current sentiment: ${inlineCode(
      data.supportVote,
   )}`;
   const description = proposalDescription + proposalReason + proposalSentiment;

   const url = `https://nouns.wtf/candidates/${data.msgSender.id}-${data.slug}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
