const { MessageEmbed } = require('discord.js');
const { inlineCode, hyperlink } = require('@discordjs/builders');

exports.generateDelegateChangedEmbed = function (data, hasMarkdown = true) {
   const title = 'Delegate Changed';
   const titleUrl = `https://etherscan.io/tx/${data.event.transactionHash}`;

   let delegator = data.delegator.name;
   let newDelegate = data.toDelegate.name;
   let voteCount = data.numOfVotesChanged;

   if (hasMarkdown) {
      delegator = hyperlink(
         delegator,
         `https://etherscan.io/address/${data.delegator.id}`,
      );
      newDelegate = hyperlink(
         newDelegate,
         `https://etherscan.io/address/${data.toDelegate.id}`,
      );
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
