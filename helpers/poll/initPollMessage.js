const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { roleMention } = require('@discordjs/builders');

const initPollMessage = async data => {
   const { title, description, channelConfig, everyoneId } = data;

   const mentions = await channelConfig.allowedRoles
      .map(role => (role !== everyoneId ? roleMention(role) : '@everyone'))
      .join(' ');

   const voteActionRow = new MessageActionRow();

   const voteBtn = new MessageButton()
      .setCustomId('vote')
      .setLabel('Vote')
      .setStyle('PRIMARY');

   const abstainBtn = new MessageButton()
      .setCustomId('abstain')
      .setLabel('Abstain')
      .setStyle('SECONDARY');

   voteActionRow.addComponents(voteBtn, abstainBtn);

   const embed = new MessageEmbed()
      .setColor('#ffffff')
      .setTitle(`${title}`)
      .setDescription(description)
      .addField('\u200B', '\u200B')
      .addField('Quorum', '...', true)
      .addField('Voters', '0', true)
      .addField('Abstains', '0', true)
      .addField('Voting Closes', '...', true)
      // .addField('Poll Results:', resultsOutput)
      // .setTimestamp()
      .setFooter('Submitted by ...');

   return {
      content: mentions,
      embeds: [embed],
      components: [voteActionRow],
   };
};

module.exports = { initPollMessage };
