const { EmbedBuilder, inlineCode, hyperlink } = require('discord.js');

const MAX_REASON_LENGTH = 1500;

exports.generateThreadStatusEmbed = function (status) {
   const threadEmbed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setDescription(`Proposal status changed to ${inlineCode(status)}`);
   return threadEmbed;
};

/**
 * @param {{proposalId: string,
 *    voter: {id: string, name: string},
 *    choice: string,
 *    proposalTitle: string,
 *    votes: number,
 *    supportDetailed: number,
 *    reason: string,
 *    event: {transactionHash: string
 * }}} vote
 * @param {string} proposalUrl
 * @param {boolean} hasMarkdown
 */
exports.generateThreadVoteEmbed = function (vote, hasMarkdown = true) {
   let voter = vote.voter.name;
   let choice = vote.choice;
   let votes = vote.votes;
   let reason = vote.reason.trim();

   if (reason.length > MAX_REASON_LENGTH) {
      reason = reason.substring(0, MAX_REASON_LENGTH).trim() + '...';
      if (vote.event?.transactionHash) {
         reason +=
            '\n' +
            hyperlink(
               'read more',
               `https://www.mmmogu.com/tx/${vote.event?.transactionHash}`,
            );
      }
   }

   if (hasMarkdown) {
      voter = hyperlink(voter, `https://etherscan.io/address/${vote.voter.id}`);
      choice = inlineCode(choice);
      votes = inlineCode(votes);
   }

   const description = `${voter} voted ${choice} with ${votes} votes.\n\n${reason}`;

   const voteEmbed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setDescription(description);

   return voteEmbed;
};
