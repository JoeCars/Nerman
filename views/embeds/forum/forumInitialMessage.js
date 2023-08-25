const { MessageEmbed } = require('discord.js');

exports.generateInitialForumMessage = (proposalId, data, proposalUrl) => {
   const url = `${proposalUrl}${proposalId}`;
   const description =
      data.description.replace(/\\n/g, '\n').replace(/!\[\]\(.+\)/g, link => {
         return link.substring(4, link.length - 1);
      }) + '...';

   const embed = new MessageEmbed()
      .setDescription(description)
      .setURL(url)
      .setColor('#00FFFF');

   return embed;
};
