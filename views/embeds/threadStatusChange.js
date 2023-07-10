const { MessageEmbed } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

exports.generateThreadStatusEmbed = function (status) {
   const threadEmbed = new MessageEmbed()
      .setColor('#00FFFF')
      .setDescription(`Proposal status changed to ${inlineCode(status)}`);
   return threadEmbed;
};
