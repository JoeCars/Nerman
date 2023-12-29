const { EmbedBuilder, hyperlink, inlineCode } = require('discord.js');

exports.generateForkProposalCreatedEmbed = function (proposal) {
   const title = 'Fork 0 | New Proposal';
   const titleUrl = `https://etherscan.io/tx/${proposal.event.transactionHash}`;
   let proposalName = `Proposal ${proposal.id}`;
   let proposalSubtitle = proposal.description.match(
      /^(#\s(?:\S+\s?)+(?:\S+\n?))/,
   );
   if (proposalSubtitle) {
      proposalSubtitle = proposalSubtitle[0].replaceAll(/^(#\s)|(\n+)$/g, '');
      proposalName = `${proposalName}: ${proposalSubtitle}`;
   }

   const proposalEmbed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(`\n${proposalName}`)
      .setURL(titleUrl);

   return proposalEmbed;
};

/**
 * @param {{id: string, status: string, proposalTitle: string}} data
 * @param {string} url
 */
exports.generateForkProposalStatusChangeEmbed = function (data) {
   let title = data.proposalTitle || `Proposal ${data.id}`;
   title = 'Fork 0 | ' + title;
   const description = data.status;

   const proposalEmbed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return proposalEmbed;
};

/**
 * @param {{
 * msgSender: {id: string, name: string},
 * tokenIds: number[],
 * }} data
 */
exports.generateForkQuitEmbed = function (data) {
   const title = 'Fork 0 | Quit';

   const quitter = hyperlink(
      data.msgSender.name,
      `https://etherscan.io/address/${data.msgSender.id}`,
   );
   const tokenNumber = inlineCode(data.tokenIds.length);
   const description = `${quitter} quit with ${tokenNumber} token(s).`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return embed;
};

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

   const voteEmbed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return voteEmbed;
};
