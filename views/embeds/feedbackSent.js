const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');

const PROPOSAL_REASON_LENGTH = 150;

/**
 * @param {{proposalId: number,
 * msgSender: {id: string, name: string},
 * proposalTitle: string,
 * supportVote: string,
 * reason: string}} data
 */
exports.generateFeedbackSentEmbed = function (data, propUrl) {
   const title = `New Feedback | ${data.proposalTitle}`;

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
         proposalReason.substring(0, PROPOSAL_REASON_LENGTH).trim() + '...';
   }
   const description = proposalDescription + proposalReason;

   const url = `${propUrl}${data.proposalId}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
