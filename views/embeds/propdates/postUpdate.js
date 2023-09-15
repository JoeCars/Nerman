const { MessageEmbed } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

/**
 * @param {{
 * 	propId: number,
 * 	isComplete: boolean,
 *	   update: string
 * 	proposalTitle: string
 * }} data
 */
exports.generatePostUpdateEmbed = function (data) {
   const title = `Propdate | ${data.proposalTitle}`;
   const url = `https://propdates-app.vercel.app/prop/${data.propId}`;

   let status = 'IN PROGRESS';
   if (data.isCompleted) {
      status = 'COMPLETE';
   }
   status = inlineCode(status);

   const description = `Current Status: ${status}\n\n${data.update}`;

   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);
};
