const {
   EmbedBuilder,
   ButtonBuilder,
   ActionRowBuilder,
   roleMention,
   ButtonStyle,
} = require('discord.js');

exports.generateInitialPollMessage = async ({
   title,
   description,
   channelConfig,
   everyoneId,
}) => {
   const mentions = await channelConfig.allowedRoles
      .map(role => (role !== everyoneId ? roleMention(role) : '@everyone'))
      .join(' ');

   const voteActionRow = new ActionRowBuilder();

   const voteBtn = new ButtonBuilder()
      .setCustomId('vote')
      .setLabel('Vote')
      .setStyle(ButtonStyle.Primary);

   const abstainBtn = new ButtonBuilder()
      .setCustomId('abstain')
      .setLabel('Abstain')
      .setStyle(ButtonStyle.Secondary);

   voteActionRow.addComponents(voteBtn, abstainBtn);

   // todo need to build in logic for max character limits in Embeds
   const embedFields = [
      { name: '\u200B', value: '\u200B', inline: false },
      { name: 'Quorum', value: '...', inline: true },
      { name: 'Voters', value: '0', inline: true },
      { name: 'Abstains', value: '0', inline: true },
      { name: 'Voting Closes', value: '...', inline: false },
   ];

   const embed = new EmbedBuilder()
      .setColor('#ffffff')
      .setTitle(title)
      .setDescription(description || null)
      .addFields(embedFields)
      .setFooter({ text: 'Submitted by ...' });

   return {
      content: mentions,
      embeds: [embed],
      components: [voteActionRow],
   };
};
