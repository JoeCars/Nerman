const { MessageEmbed } = require('discord.js');
const Poll = require('../../db/schemas/Poll');
const Logger = require('../../helpers/logger');

/**
 * @param {{id: string, status: string, title: string}} data
 * @param {string} url
 */
exports.generatePropStatusChangeEmbed = async function (data, url) {
   const title = data.title || `Proposal ${data.id}`;
   const description = `${url}${data.id}\n${data.status}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#000000')
      .setTitle(title)
      .setDescription(description);

   return proposalEmbed;
};
