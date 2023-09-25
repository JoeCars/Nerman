const { MessageEmbed } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

const UPDATE_MAX_LENGTH = 300;

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

   let update = data.update;
   if (update.length > UPDATE_MAX_LENGTH) {
      update = update.substring(0, UPDATE_MAX_LENGTH).trim();
      update += '...';
   }

   const description = `Current Status: ${status}\n\n${update}`;

   return new MessageEmbed()
      .setColor('#00FFFF')
      .setTitle(title)
      .setDescription(description)
      .setURL(url);
};
