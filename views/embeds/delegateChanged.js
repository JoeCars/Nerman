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

   const votes = hasMarkdown ? inlineCode(data.events.data) : data.events.data;
   Logger.debug('views/embeds/delegateChanged.js: Checking votes and data.', {
      votes: votes,
      data: data,
   });

   const message = `${delegator} delegated votes to ${newDelegate}.`;

   const embed = new MessageEmbed().setTitle(title).setDescription(message);

   if (hasMarkdown) {
      embed.setURL(titleUrl);
   }

   return embed;
};
