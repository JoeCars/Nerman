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
 * }} data
 */
exports.generateFederationVoteEmbed = function (
   data,
   proposalUrl,
   hasMarkdown = true,
) {
   const amount = getEthAmount(data.amount);
   let bidderLink = data.bidderName;
   let vote = data.supportVote;
   let proposal = `Proposal ${data.propId}`;

   if (hasMarkdown) {
      bidderLink = hyperlink(
         data.bidderName,
         `https://etherscan.io/address/${data.bidder}`,
      );
      vote = inlineCode(data.supportVote);
      proposal = hyperlink(
         `Proposal ${data.propId}`,
         `${proposalUrl}${data.propId}`,
      );
   }

   const text = `Federation has voted ${vote} on ${proposal} on behalf of ${bidderLink}'s winning bid of ${amount}Ξ.`;

   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(`Federation Vote Cast`)
      .setDescription(text);
};
