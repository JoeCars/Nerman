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

   const url = `https://nouns.wtf/candidates/${data.msgSender.id}-${data.slug}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
