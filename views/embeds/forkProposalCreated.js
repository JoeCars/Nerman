const { MessageEmbed } = require('discord.js');

exports.generateForkProposalCreatedEmbed = function (proposal) {
   const title = 'Fork 0 | New Proposal';
   const titleUrl = `https://etherscan.io/tx/${data.event.transactionHash}`;
   let proposalName = `Proposal ${proposal.id}`;
   let proposalSubtitle = proposal.description.match(
      /^(#\s(?:\S+\s?)+(?:\S+\n?))/,
   );
   if (proposalSubtitle) {
      proposalSubtitle = proposalSubtitle[0].replaceAll(/^(#\s)|(\n+)$/g, '');
      proposalName = `${proposalName}: ${proposalSubtitle}`;
   }

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(`\n${proposalName}`)
      .setURL(titleUrl);

   return proposalEmbed;
};
