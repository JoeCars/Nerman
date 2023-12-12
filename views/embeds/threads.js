const { EmbedBuilder } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

exports.generateThreadStatusEmbed = function (status) {
   const threadEmbed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setDescription(`Proposal status changed to ${inlineCode(status)}`);
   return threadEmbed;
};

const { findAccountENS } = require('../helpers');

exports.generateThreadVoteEmbed = async function (vote, nouns) {
   const {
      proposalId,
      voter: { id: voterId },
      votes,
      supportDetailed,
      reason,
   } = vote;

   const voter = await findAccountENS(nouns, voterId);
   const voterUrl = `https://etherscan.io/address/${voterId}`;
   const voterHyperlink = `[${voter}](${voterUrl})`;
   const propHyperlink = hyperlink(
      `Prop ${proposalId}`,
      `https://nouns.wtf/vote/${proposalId}`,
   );

   const supportEnum = ['AGAINST', 'FOR', 'ABSTAIN'];
   const threadEmbed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setDescription(
         `${voterHyperlink} voted ${inlineCode(
            supportEnum[supportDetailed],
         )} with ${inlineCode(Number(votes))} votes on ${propHyperlink}. ${
            reason.trim() ? `\n\n${reason}` : ''
         }`,
      );

   return threadEmbed;
};
