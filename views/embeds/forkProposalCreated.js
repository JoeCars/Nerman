const { MessageEmbed } = require('discord.js');

exports.generateForkProposalCreatedEmbed = function (proposal) {
   const title = 'Fork 0 | New Proposal';
   const proposalName = `Proposal ${proposal.id}: ${proposal.description
      .match(/^(#\s(?:\S+\s?)+(?:\S+\n?))/)[0]
      .replaceAll(/^(#\s)|(\n+)$/g, '')}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(`\n${proposalName}}`);

   return proposalEmbed;
};
