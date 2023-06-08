const shortenAddress = require('./nouns/shortenAddress');
const { MessageEmbed } = require('discord.js');

exports.getTitle = function (proposal) {
   return `Prop ${proposal.id}: ${proposal.description
      .match(/^#+\s+.+\n/)[0]
      .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
};

exports.getUrl = function (proposal) {
   return `https://nouns.wtf/vote/${proposal.id}`;
};

exports.proposalStatusUpdateMessage = function (proposal, proposalStatus) {
   return `
		Proposal ${proposal.id} status changed to ${proposalStatus}.\n
		${getUrl(proposal)}
	`;
};

exports.createInitialVoteEmbed = async function (vote, nouns) {
   const voter =
      (await nouns.ensReverseLookup(vote.voter.id)) ??
      (await shortenAddress(vote.voter.id));
   const choice = ['AGAINST', 'FOR', 'ABSTAIN'][vote.supportDetailed];

   const title = `Prop ${vote.proposalId}.`;
   const description = `${voter} voted ${choice} with ${vote.votes} votes.\n${vote.reason}`;

   const voteEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return voteEmbed;
};

exports.temporaryNewProposalMessage = function (proposal) {
   return `
      New Proposal\n
      ${getTitle(proposal)}\n
      ${getUrl(proposal)}
   `;
};
