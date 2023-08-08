const { MessageEmbed } = require('discord.js');
const { hideLinkEmbed } = require('@discordjs/builders');

exports.generatePropCreatedEmbed = function (proposal, proposalUrl) {
   const title = 'New Proposal!';
   const proposalName = `Proposal ${proposal.id}: ${proposal.description
      .match(/^(#\s(?:\S+\s?)+(?:\S+\n?))/)[0]
      .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
   const url = `${proposalUrl}${proposal.id}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(`\u200B\n${proposalName}\n\n${hideLinkEmbed(url)}`);

   return proposalEmbed;
};
