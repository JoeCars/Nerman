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

exports.createProposalStatusEmbed = function (proposal, proposalStatus) {
   const title = `Proposal ${proposal.id} status changed to ${proposalStatus}.`;
   const description = getUrl(proposal);

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return proposalEmbed;
};

exports.createInitialVoteEmbed = async function (vote, nouns) {
   const voter =
      (await nouns.ensReverseLookup(vote.voter.id)) ??
      (await shortenAddress(vote.voter.id));
   const choice = ['AGAINST', 'FOR', 'ABSTAIN'][vote.supportDetailed];
   const titleUrl = `https://nouns.wtf/vote/${vote.proposalId}`;
   const description = `${voter} voted ${choice} with ${vote.votes} votes.\n\n${vote.reason}`;

   const targetPoll = await Poll.findOne({
      'pollData.title': {
         $regex: new RegExp(`^prop\\s${Number(vote.proposalId)}`, 'i'),
      },
   })
      .populate('config')
      .exec();

   const title = targetPoll?.pollData.title ?? `Prop ${vote.proposalId}.`;

   const voteEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setURL(titleUrl)
      .setDescription(description);

   return voteEmbed;
};

exports.createNewProposalEmbed = function (proposal) {
   const title = 'New Proposal!';
   const description = `Proposal ${proposal.id}: ${proposal.description
      .match(/^#+\s+.+\n/)[0]
      .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
   const descriptionUrl = `https://nouns.wtf/vote/${propId}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(`${description}\n\n${descriptionUrl}`);

   return proposalEmbed;
};
