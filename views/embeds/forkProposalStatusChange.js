const { MessageEmbed } = require('discord.js');

/**
 * @param {{id: string, status: string, proposalTitle: string}} data
 * @param {string} url
 */
exports.generateForkProposalStatusChangeEmbed = function (data) {
   let title = data.proposalTitle || `Proposal ${data.id}`;
   title = 'Fork 0 | ' + title;
   const description = data.status;

   const proposalEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description);

   return proposalEmbed;
};
