const { EmbedBuilder, hyperlink, inlineCode } = require('discord.js');

const PROPOSAL_REASON_LENGTH = 1500;
const DISCORD_TITLE_LIMIT = 250; // Actually 256 but leaving space for ellipses.

/**
 * @param {{slug: string,
 * msgSender: {id: string, name: string},
 * proposer: {id: string, name: string},
 * supportVote: string,
 * reason: string}} data
 *
 */
exports.generateCandidateFeedbackSentEmbed = function (data) {
   const proposalTitle = data.slug
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');
   let title = `New Candidate Feedback | ${proposalTitle}`;
   if (title.length > DISCORD_TITLE_LIMIT) {
      title = title.substring(0, DISCORD_TITLE_LIMIT) + '...';
   }

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

   const url = `https://nouns.wtf/candidates/${data.proposer.id.toLowerCase()}-${
      data.slug
   }`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};

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
         '\n\n' +
         proposalReason.substring(0, PROPOSAL_REASON_LENGTH).trim() +
         '...';
   }
   const description = proposalDescription + proposalReason;

   const url = `${propUrl}${data.proposalId}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};

/**
 * @param {{slug: string,
 * msgSender: {id: string, name: string},
 * reason: string}} proposal
 */
exports.generateProposalCandidateCanceledEmbed = function (proposal) {
   const title = `Proposal Candidate Canceled`;

   const proposer = hyperlink(
      proposal.msgSender.name,
      `https://etherscan.io/address/${proposal.msgSender.id}`,
   );
   const proposalTitle = proposal.slug
      .trim()
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1).toLowerCase();
      })
      .join(' ');
   const proposalUrl = `https://nouns.wtf/candidates/${proposal.msgSender.id.toLowerCase()}-${
      proposal.slug
   }`;
   const proposalName = hyperlink(proposalTitle, proposalUrl);
   const reason = proposal.reason ? `\n\n${proposal.reason}` : '';
   const description = `${proposer} has ${inlineCode(
      'CANCELED',
   )} their proposal candidate (${proposalName}).${reason}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return embed;
};

/**
 * @param {{slug: string, msgSender: {id: string, name: string}, description: string}} proposal
 */
exports.generateProposalCandidateCreatedEmbed = function (proposal) {
   const proposalTitle = proposal.slug
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');
   let title = `New Proposal Candidate: ${proposalTitle}`;
   if (title.length > DISCORD_TITLE_LIMIT) {
      title = title.substring(0, DISCORD_TITLE_LIMIT) + '...';
   }

   const proposer = hyperlink(
      proposal.msgSender.name,
      `https://etherscan.io/address/${proposal.msgSender.id}`,
   );
   const description = `Proposed by ${proposer}`;

   const url = `https://nouns.wtf/candidates/${proposal.msgSender.id.toLowerCase()}-${
      proposal.slug
   }`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};

/**
 * @param {{slug: string,
 * msgSender: {id: string, name: string},
 * reason: string}} proposal
 */
exports.generateProposalCandidateUpdatedEmbed = function (proposal) {
   const title = `Proposal Candidate Updated`;

   const proposer = hyperlink(
      proposal.msgSender.name,
      `https://etherscan.io/address/${proposal.msgSender.id}`,
   );
   const proposalTitle = proposal.slug
      .trim()
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1).toLowerCase();
      })
      .join(' ');
   const proposalUrl = `https://nouns.wtf/candidates/${proposal.msgSender.id.toLowerCase()}-${
      proposal.slug
   }`;
   const proposalName = hyperlink(proposalTitle, proposalUrl);
   const reason = proposal.reason ? `\n\n${proposal.reason}` : '';
   const description = `${proposer} has ${inlineCode(
      'UPDATED',
   )} their proposal candidate (${proposalName}).${reason}`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return embed;
};

/**
 * @param {{slug: string, proposer: {id: string, name: string}, signer: {id: string, name: string}, reason: string, votes: number}} data
 */
exports.generateSignatureAddedEmbed = function (data) {
   const proposalTitle = data.slug
      .split('-')
      .filter(word => {
         return word.trim();
      })
      .map(word => {
         return word[0].toUpperCase() + word.substring(1);
      })
      .join(' ');
   let title = `Candidate Proposal Signed: ${proposalTitle}`;
   if (title.length > DISCORD_TITLE_LIMIT) {
      title = title.substring(0, DISCORD_TITLE_LIMIT) + '...';
   }

   const proposer = hyperlink(
      data.proposer.name,
      `https://etherscan.io/address/${data.proposer.id}`,
   );
   const signer = hyperlink(
      data.signer.name,
      `https://etherscan.io/address/${data.signer.id}`,
   );
   const votes = inlineCode(data.votes);
   const reason = data.reason ? `\n\n${data.reason}` : '';
   const description = `${signer} signed ${proposer}'s proposal with ${votes} vote(s).${reason}`;

   const url = `https://nouns.wtf/candidates/${data.proposer.id.toLowerCase()}-${
      data.slug
   }`;

   const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);

   return embed;
};
