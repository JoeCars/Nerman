const {
   EmbedBuilder,
   ButtonBuilder,
   ActionRowBuilder,
   roleMention,
} = require('discord.js');

const Logger = require('../logger');

const initPollMessage = async ({
   // propId,
   title,
   description,
   channelConfig,
   everyoneId,
}) => {
   Logger.info('helpers/poll/initPollMessage.js: Initializing poll message.', {
      proposalTitle: title,
      proposalDescription: description,
      channelConfig: channelConfig,
      everyoneId: everyoneId,
   });

   const mentions = await channelConfig.allowedRoles
      .map(role => (role !== everyoneId ? roleMention(role) : '@everyone'))
      .join(' ');

   const voteActionRow = new ActionRowBuilder();

   const voteBtn = new ButtonBuilder()
      .setCustomId('vote')
      .setLabel('Vote')
      .setStyle('PRIMARY');

   const abstainBtn = new ButtonBuilder()
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

   Logger.debug('helpers/poll/initPollMessage.js: Checking embed fields.', {
      proposalTitle: title,
      embedFields: embedFields,
   });

   // disabled until Joel decides if we need this here
   // if (channelConfig.voteThreshold > 0) {
   //    console.log('THRESHOLD IS ABOVE 0');

   //    embedFields.splice(2, 0, {
   //       name: 'Vote Threshold',
   //       value: '...',
   //       inline: true,
   //    });
   // }

   const embed = new EmbedBuilder()
      .setColor('#ffffff')
      .setTitle(title)
      .setDescription(description)
      .addFields(embedFields)
      .setFooter({ text: 'Submitted by ...' });

   Logger.debug(
      'helpers/poll/initPollMessage.js: Finished initializing poll message.',
      {
         proposalTitle: title,
      },
   );

   return {
      content: mentions,
      embeds: [embed],
      components: [voteActionRow],
   };
};

module.exports = { initPollMessage };
