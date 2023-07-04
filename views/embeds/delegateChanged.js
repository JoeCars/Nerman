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
      const firstData = receipt.logs[0].data;
      const secondData = receipt.logs[1].data;
      const thirdData = receipt.logs[2].data;

      // The number of votes being changes is stored in receipt logs index 1 and 2.
      // It is formatted as a single hex, where the first 64 digits after 0x is the previous vote count.
      // And the second 64 digits after 0x is the new vote count of the delegate.
      // To see this in detail, follow the link of the delegate changed event and check the receipt logs.
      const usefulData = firstData;
      const numberSubstring = usefulData.substring(2);
      const firstHex = numberSubstring.substring(0, 65);
      const secondHex = numberSubstring.substring(65);
      const firstNum = parseInt(firstHex, 16);
      const secondNum = parseInt(secondHex, 16);

      const numOfVotesChanged = Math.abs(firstNum - secondNum);

      Logger.debug(
         'views/embeds/delegateChanged.js: Checking transaction receipt data.',
         {
            numOfVotes: numOfVotesChanged,
            firstData: firstData,
            secondData: secondData,
            thirdData: thirdData,
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
