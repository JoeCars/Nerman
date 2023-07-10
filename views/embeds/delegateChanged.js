const { MessageEmbed } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');
const Logger = require('../../helpers/logger');

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
   if (hasMarkdown) {
      delegator = await findAccountLink(nouns, data.delegator.id);
      newDelegate = await findAccountLink(nouns, data.toDelegate.id);
   }

   let voteCount = '';
   try {
      const event = data.event;
      const receipt = await event.getTransactionReceipt();
      const hexData = receipt.logs[1].data;

      // The number of votes being changes is stored in receipt logs index 1 and 2.
      // It is formatted as a single hex, where the first 64 digits after 0x is the previous vote count.
      // And the second 64 digits after 0x is the new vote count of the delegate.
      // To see this in detail, follow the link of the delegate changed event and check the receipt logs.
      const numOfVotesChanged = exports.extractVoteChange(hexData);

      Logger.debug(
         'views/embeds/delegateChanged.js: Checking transaction receipt data.',
         {
            numOfVotes: numOfVotesChanged,
            logs: receipt.logs,
         },
      );
      voteCount = `${inlineCode(numOfVotesChanged)} `;
   } catch (error) {
      Logger.error("views/embeds/delegateChanged.js: There's been an error.", {
         error: error,
      });
   }

   const message = `${delegator} delegated ${voteCount}votes to ${newDelegate}.`;

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
