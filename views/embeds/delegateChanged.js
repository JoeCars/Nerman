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
   if (hasMarkdown) {
      delegator = await findAccountLink(nouns, data.delegator.id);
      newDelegate = await findAccountLink(nouns, data.toDelegate.id);
   }

   const votes = hasMarkdown ? inlineCode(data.events.data) : data.events.data;

   const message = `${delegator} delegated ${votes} votes to ${newDelegate}.`;

   const embed = new MessageEmbed().setTitle(title).setDescription(message);

   if (hasMarkdown) {
      embed.setURL(titleUrl);
   }

   return embed;
};
