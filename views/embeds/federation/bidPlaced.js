const { MessageEmbed } = require('discord.js');
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

   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(text)
      .setURL(url);
};
