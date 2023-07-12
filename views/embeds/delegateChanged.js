const { MessageEmbed } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

const { findAccountENS, findAccountLink } = require('../helpers');

exports.generateDelegateChangedEmbed = async function (
   nouns,
   data,
   hasMarkdown = true,
) {
   const title = 'Delegate Changed';
   const titleUrl = `https://etherscan.io/tx/${data.event.transactionHash}`;

   let delegator = await findAccountENS(nouns, data.delegator.id);
   let newDelegate = await findAccountENS(nouns, data.toDelegate.id);
   let voteCount = data.numOfVotesChanged;

   if (hasMarkdown) {
      delegator = await findAccountLink(nouns, data.delegator.id);
      newDelegate = await findAccountLink(nouns, data.toDelegate.id);
      voteCount = inlineCode(voteCount);
   }

   const message = `${delegator} delegated ${voteCount} votes to ${newDelegate}.`;

   const embed = new MessageEmbed().setTitle(title).setDescription(message);

   if (hasMarkdown) {
      embed.setURL(titleUrl);
   }

   return embed;
};

/**
 * @param {string} hexData
 */
exports.extractVoteChange = function (hexData) {
   hexData = hexData.substring(2);

   const hex1 = hexData.substring(0, 64);
   const hex2 = hexData.substring(64);
   const num1 = parseInt(hex1, 16);
   const num2 = parseInt(hex2, 16);

   return Math.abs(num1 - num2);
};
