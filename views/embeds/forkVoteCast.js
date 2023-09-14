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
exports.generateForkVoteCastEmbed = function (vote, hasMarkdown = true) {
   let voter = vote.voter.name;
   let choice = vote.choice;
   let votes = vote.votes;
   const reason = vote.reason.trim();

   if (hasMarkdown) {
      voter = hyperlink(voter, `https://etherscan.io/address/${vote.voter.id}`);
      choice = inlineCode(choice);
      votes = inlineCode(votes);
   }

   const title = 'Fork 0 | ' + vote.proposalTitle;
   const description = `${voter} voted ${choice} with ${votes} votes.\n\n${reason}`;

   const voteEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return voteEmbed;
};
