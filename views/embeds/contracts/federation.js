const { EmbedBuilder } = require('discord.js');
const { hyperlink, inlineCode } = require('@discordjs/builders');
const { getEthAmount } = require('../../helpers');

/**
 * @param {{
 *  dao: string,
 * 	propId: number,
 *	support: number,
 *	supportVote: string,
 *	amount: number,
 *	bidder: string,
 *	bidderName: string,
 *	reason?: string,
 * voteNumber: number
 * }} data
 */
exports.generateFederationBidEmbed = function (
   data,
   proposalUrl,
   hasMarkdown = true,
) {
   const title = `Nouns Gov Pool | ${data.proposalTitle}`;
   const url = `https://www.federation.wtf/governance-pools/0x0f722d69B3D8C292E85F2b1E5D9F4439edd58F1e/${data.propId}`;

   const amount = getEthAmount(data.amount);
   let bidderLink = data.bidderName;
   let vote = data.supportVote;
   let bidAmount = `${amount}Ξ`;
   let voteNumber = data.voteNumber;

   if (hasMarkdown) {
      bidderLink = hyperlink(
         data.bidderName,
         `https://etherscan.io/address/${data.bidder}`,
      );
      vote = inlineCode(data.supportVote);
      bidAmount = inlineCode(bidAmount);
      voteNumber = inlineCode(voteNumber);
   }

   const text = `${bidderLink} bid ${bidAmount} to vote ${vote} with ${voteNumber} votes.`;

   return new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(text)
      .setURL(url);
};

/**
 * @param {{
 *    dao: string,
 *    propId: number,
 *	   support: number,
 *	   supportVote: string,
 *	   amount: number,
 *	   bidder: string,
 *	   bidderName: string,
 *    proposalTitle: string
 *    voteNumber: number
 * }} data
 */
exports.generateFederationVoteEmbed = function (
   data,
   proposalUrl,
   hasMarkdown = true,
) {
   const title = `Nouns Gov Pool | ${data.proposalTitle}`;
   const url = `https://www.federation.wtf/governance-pools/0x0f722d69B3D8C292E85F2b1E5D9F4439edd58F1e/${data.propId}`;

   const amount = getEthAmount(data.amount);
   let bidAmount = `${amount}Ξ`;
   let bidderLink = data.bidderName;
   let vote = data.supportVote;
   let proposal = `Proposal ${data.propId}`;
   let voteNumber = data.voteNumber;

   if (hasMarkdown) {
      bidAmount = inlineCode(bidAmount);
      bidderLink = hyperlink(
         data.bidderName,
         `https://etherscan.io/address/${data.bidder}`,
      );
      vote = inlineCode(data.supportVote);
      proposal = hyperlink(
         `Proposal ${data.propId}`,
         `${proposalUrl}${data.propId}`,
      );
      voteNumber = inlineCode(voteNumber);
   }

   const text = `Voted ${vote} with ${voteNumber} votes on ${proposal}.\nWinning bid: ${bidAmount} from ${bidderLink}`;

   return new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(text)
      .setURL(url);
};
