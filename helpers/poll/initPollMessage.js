const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { roleMention } = require('@discordjs/builders');

const initPollMessage = async ({
   // propId,
   title,
   description,
   channelConfig,
   everyoneId,
}) => {
   // const { propId, title, description, channelConfig, everyoneId } = data;

   // if (propId) {
   //    title = `Prop ${propId}: ${title}`
   // }

   // console.log('LOGGING PROP NUMBER', { propIdT });
   console.log('LOGGING PROP DATA', {
      title,
      description,
      channelConfig,
      everyoneId,
   });

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


   // todo need to build in logic for max character limits in Embeds
   const embedFields = [
      { name: '\u200B', value: '\u200B', inline: false },
      { name: 'Quorum', value: '...', inline: true },
      { name: 'Voters', value: '0', inline: true },
      { name: 'Abstains', value: '0', inline: true },
      { name: 'Voting Closes', value: '...', inline: false },
   ];

   console.log('/////////////////////// EMBED FIELDS ///////////////////////');
   console.log(embedFields);

   console.log(channelConfig);
   console.log(channelConfig.voteThreshold);

   // disabled until Joel decides if we need this here
   // if (channelConfig.voteThreshold > 0) {
   //    console.log('THRESHOLD IS ABOVE 0');

   //    embedFields.splice(2, 0, {
   //       name: 'Vote Threshold',
   //       value: '...',
   //       inline: true,
   //    });
   // }

   console.log('/////////////////////// EMBED FIELDS ///////////////////////');
   console.log(embedFields);

   const embed = new MessageEmbed()
      .setColor('#ffffff')
      .setTitle(title)
      // .setDescription(description)
      .addFields(embedFields)
      // .addField('\u200B', '\u200B')
      // .addField('Quorum', '...', true)
      // .addField('Voters', '0', true)
      // .addField('Abstains', '0', true)
      // .addField('Voting Closes', '...', true)
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
