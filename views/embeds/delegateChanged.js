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

   try {
      const event = data.event;
      const receipt = await event.getTransactionReceipt();
      const firstData = receipt.logs[0].data;
      const secondData = receipt.logs[1].data;
      const thirdData = receipt.logs[2].data;
      Logger.debug(
         'views/embeds/delegateChanged.js: Checking transaction receipt data.',
         {
            firstData: firstData,
            secondData: secondData,
            thirdData: thirdData,
            logs: receipt.logs,
         },
      );
   } catch (error) {
      Logger.error("views/embeds/delegateChanged.js: There's been an error.", {
         error: error,
      });
   }

   const message = `${delegator} delegated votes to ${newDelegate}.`;

   const embed = new MessageEmbed().setTitle(title).setDescription(message);

   if (hasMarkdown) {
      embed.setURL(titleUrl);
   }

   return embed;
};
