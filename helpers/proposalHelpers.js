const { MessageEmbed } = require('discord.js');

exports.getTitle = function (proposal) {
   return `Prop ${proposal.id}: ${proposal.description
      .match(/^#+\s+.+\n/)[0]
      .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
};

exports.getUrl = function (proposal) {
   return `https://nouns.wtf/vote/${proposal.id}`;
};

exports.createNewProposalEmbed = function (proposal) {
   const title = 'New Proposal!';
   const description = `Proposal ${proposal.id}: ${proposal.description
      .match(/^#+\s+.+\n/)[0]
      .replaceAll(/^(#\s)|(\n+)$/g, '')}`;
   const descriptionUrl = `https://nouns.wtf/vote/${proposal.id}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(`${description}\n\n${descriptionUrl}`);

   return proposalEmbed;
};
