const { MessageEmbed } = require('discord.js');
const { hyperlink, hideLinkEmbed, inlineCode } = require('@discordjs/builders');
const { getEthAmount } = require('../../helpers');

const DEFAULT_MINT_ID = '0x0000000000000000000000000000000000000000';

/**
 * @param {{
 *    id: string,
 *    bidder: {id: string, name: string},
 *    amount: BigNumber
 * }} data
 */
exports.generateAuctionBidEmbed = function (data) {
   const bidderLink = hyperlink(
      data.bidder.name,
      `https://etherscan.io/address/${data.bidder.id}`,
   );
   const amount = getEthAmount(data.amount);
   const lilNoun = hyperlink(
      `Lil Noun ${data.id}`,
      `https://lilnouns.wtf/lilnoun/${data.id}`,
   );

   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(`Lil Nouns | Auction Bid`)
      .setDescription(`${bidderLink} bid ${amount}Ξ on ${lilNoun}`);
};

exports.generateAuctionCreatedEmbed = function (data) {
   const lilNouns = hyperlink(
      `Lilnouns.wtf`,
      `https://lilnouns.wtf/lilnoun/${data.id}`,
   );

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setDescription(lilNouns)
      .setTitle(`New Auction | Lil Noun ${data.id}`);

   return embed;
};

exports.generateProposalCreatedEmbed = function (proposal) {
   const title = `New Lil Nouns Proposal | Proposal ${proposal.id}`;
   const proposalName = proposal.proposalTitle;
   const url = `https://lilnouns.wtf/vote/${proposal.id}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(`\u200B\n${proposalName}\n\n${hideLinkEmbed(url)}`);

   return proposalEmbed;
};

/**
 * @param {{id: string, status: string, proposalTitle: string}} data
 */
exports.generateProposalStatusChangeEmbed = function (data) {
   const title = `Lil Nouns | ${data.proposalTitle}`;
   const description = `https://lilnouns.wtf/vote/${data.id}\n${data.status}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return proposalEmbed;
};

/**
 * @param {{proposalId: string,
 *    voter: {id: string, name: string},
 *    choice: string,
 *    proposalTitle: string,
 *    votes: number,
 *    supportDetailed: number,
 *    reason: string}} vote
 * @param {boolean} hasMarkdown
 */
exports.generateVoteCastEmbed = function (vote, hasMarkdown = true) {
   let voter = vote.voter.name;
   let choice = vote.choice;
   let votes = vote.votes;
   const reason = vote.reason.trim();

   if (hasMarkdown) {
      voter = hyperlink(voter, `https://etherscan.io/address/${vote.voter.id}`);
      choice = inlineCode(choice);
      votes = inlineCode(votes);
   }

   const title = `Lil Nouns | ${vote.proposalTitle}`;
   const titleUrl = `https://lilnouns.wtf/vote/${vote.proposalId}`;
   const description = `${voter} voted ${choice} with ${votes} votes.\n\n${reason}`;

   const voteEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setURL(titleUrl)
      .setDescription(description);

   return voteEmbed;
};

/**
 * @param {{
 *    from: {id: string, name: string},
 *    to: {id: string, name: string},
 *    tokenId: string}} data
 * @param {boolean} hasMarkdown
 */
exports.generateTransferEmbed = function (data, hasMarkdown = true) {
   let title = `Transfer | Lil Noun ${data.tokenId}`;
   if (data.from.id === data.to.id) {
      title = `Stanky Shameless Washing | Lil Noun ${data.tokenId}`;
   } else if (data.from.id === DEFAULT_MINT_ID) {
      title = `Mint | Lil Noun ${data.tokenId}`;
   }

   let fromWallet = data.from.name;
   let toWallet = data.to.name;
   if (hasMarkdown) {
      fromWallet = hyperlink(
         fromWallet,
         `https://etherscan.io/address/${data.from.id}`,
      );
      toWallet = hyperlink(
         toWallet,
         `https://etherscan.io/address/${data.to.id}`,
      );
   }
   const description = `From ${fromWallet} to ${toWallet}`;

   const embed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);
   return embed;
};
