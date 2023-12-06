const { MessageEmbed } = require('discord.js');
const {
   hyperlink,
   inlineCode,
   italic,
   hideLinkEmbed,
} = require('@discordjs/builders');

const PROPOSAL_REASON_LENGTH = 1500;

/**
 * @param {{forkId: number,
 * owner: {id: string, name: string},
 * tokenIds: number[],
 * reason: string,
 * currentEscrowAmount: number,
 * totalSupply: number,
 * thresholdNumber, number,
 * currentPercentage: number
 * }} data
 */
exports.generateEscrowedToForkEmbed = function (data) {
   const title = `Tokens Escrowed To Fork ${data.forkId}!`;

   const owner = hyperlink(
      data.owner.name,
      `https://etherscan.io/address/${data.owner.id}`,
   );
   const tokenNumber = inlineCode(data.tokenIds.length);
   const escrowDescription = `${owner} escrowed ${tokenNumber} token(s).`;

   const status = italic(
      `\n\n${data.currentEscrowAmount} Nouns in escrow - ${data.currentPercentage}% of fork threshold.`,
   );

   let escrowReason = '';
   if (data.reason.trim()) {
      escrowReason = '\n\n' + data.reason.trim();
   }
   if (escrowReason.length > PROPOSAL_REASON_LENGTH) {
      escrowReason =
         '\n\n' +
         escrowReason.substring(0, PROPOSAL_REASON_LENGTH).trim() +
         '...';
   }
   const description = escrowDescription + status + escrowReason;

   const url = `https://nouns.wtf/fork/${data.forkId}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};

/**
 * @param {{forkId: number,
 * forkTreasury: {id: string, name: string},
 * forkToken: {id: string, name: string},
 * forkEndTimestamp: number,
 * tokensInEscrow: number
 * reason: string}} data
 */
exports.generateExecuteForkEmbed = function (data) {
   const title = `Fork Executed!`;

   const url = `https://nouns.wtf/fork/${data.forkId}`;

   const forkName = hyperlink(`Fork ${data.forkId}`, url);

   const description = `${forkName} executed with ${inlineCode(
      data.tokensInEscrow,
   )} tokens!`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};

const REASON_LENGTH = 1500;

/**
 * @param {{forkId: number,
 * owner: {name: string, id: string},
 * tokenIds: number[],
 * proposalIds: number[],
 * reason: reason
 * }} data
 *
 */
exports.generateJoinForkEmbed = function (data) {
   const title = `Fork ${data.forkId} Joined!`;

   const url = `https://nouns.wtf/fork/${data.forkId}`;

   const owner = hyperlink(
      data.owner.name,
      `https://etherscan.io/address/${data.owner.id}`,
   );
   const fork = hyperlink(`Fork ${data.forkId}`, url);
   const tokens = inlineCode(data.tokenIds.length);

   let reason = data.reason.trim();
   if (reason.length > REASON_LENGTH) {
      reason = reason.substring(0, REASON_LENGTH).trim() + '...';
   }
   if (reason) {
      reason = '\n\n' + reason;
   }

   const description =
      `${owner} joined ${fork} with ${tokens} token(s).` + reason;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};

exports.generatePropCreatedEmbed = function (proposal, proposalUrl) {
   const title = 'New Proposal!';
   const proposalName = proposal.proposalTitle;
   const url = `${proposalUrl}${proposal.id}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(`\u200B\n${proposalName}\n\n${hideLinkEmbed(url)}`);

   return proposalEmbed;
};

/**
 * @param {{id: string, status: string, proposalTitle: string}} data
 * @param {string} url
 */
exports.generatePropStatusChangeEmbed = function (data, url) {
   const title = data.proposalTitle || `Proposal ${data.id}`;
   const description = `${url}${data.id}\n${data.status}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return proposalEmbed;
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
exports.generatePropVoteCastEmbed = function (
   vote,
   proposalUrl,
   hasMarkdown = true,
) {
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

/**
 * @param {{tokenIds: number[],
 * to: {id: string, name: string}}} data
 */
exports.generateWithdrawNounsFromEscrowEmbed = function (data) {
   const title = `Nouns Withdrawn From Escrow!`;

   const withdrawer = hyperlink(
      data.to.name,
      `https://etherscan.io/address/${data.to.id}`,
   );
   const nounsWithdrawn = inlineCode(data.tokenIds.length);

   const description = `${withdrawer} withdrew ${nounsWithdrawn} tokens from escrow.`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return embed;
};
