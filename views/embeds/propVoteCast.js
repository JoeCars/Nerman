const { MessageEmbed } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');

/**
 *
 * @param {{proposalId: string,
 *    voter: {id: string, name: string},
 *    choice: string,
 *    proposalTitle: string,
 *    votes: number,
 *    supportDetailed: number,
 *    reason: string}} vote
 * @param {string} proposalUrl
 * @param {boolean} hasMarkdown
 */
exports.generatePropVoteCastEmbed = function (
   vote,
   proposalUrl,
   hasMarkdown = true,
) {
   // This information should only be done once, and would be nice to do it at a higher level.
   let voter = vote.voter.name;
   let choice = vote.choice;
   let votes = vote.votes;
   const reason = vote.reason.trim();

   if (hasMarkdown) {
      voter = hyperlink(voter, `https://etherscan.io/address/${vote.voter.id}`);
      choice = inlineCode(choice);
      votes = inlineCode(votes);
   }

   const title = vote.proposalTitle;
   const titleUrl = `${proposalUrl}${vote.proposalId}`;
   const description = `${voter} voted ${choice} with ${votes} votes.\n\n${reason}`;

   const voteEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setURL(titleUrl)
      .setDescription(description);

   return voteEmbed;
};
