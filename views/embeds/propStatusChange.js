const { MessageEmbed } = require('discord.js');
const Poll = require('../../db/schemas/Poll');
const Logger = require('../../helpers/logger');

/**
 * @param {{id: string, status: string}} data
 * @param {string} url
 */
exports.generatePropStatusChangeEmbed = async function (data, url) {
   let title = `Proposal ${data.id}`;
   try {
      const targetPoll = await Poll.findOne({
         'pollData.title': {
            $regex: new RegExp(`^prop\\s${Number(data.id)}`, 'i'),
         },
      }).exec();
      title = targetPoll ? targetPoll.pollData.title : title;
   } catch (error) {
      Logger.error('Unable to find poll for status change.');
   }

   const description = `${url}${data.id}\n${data.status}`;

   const proposalEmbed = new MessageEmbed()
      .setColor('#000000')
      .setTitle(title)
      .setDescription(description);

   return proposalEmbed;
};
