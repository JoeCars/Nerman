const { ButtonInteraction } = require('discord.js');
const DB = require('../db/schemas/PollSchema');

module.exports = {
   name: 'interactionCreate',
   /**
    * @param {ButtonInteraction} interaction
    */
   async execute(interaction) {
      if (!interaction.isButton()) return;
      if (!interaction.member.permissions.has('ADMINISTRATOR')) {
         return interaction.reply({
            content: 'You do not have permission to use this button.',
            ephemeral: true,
         });
      }

      const { guildId, customId, message } = interaction;

      DB.findOne(
         { GuildID: guildId, MessageID: message.id },
         async (err, data) => {
            if (err) throw err;
            if (!data)
               return interaction.reply({
                  content: 'No data found in the DB',
                  ephemeral: true,
               });

            const embed = message.embeds[0];
            if (!embed) return;

            switch (customId) {
               case 'yes': {
                  embed.fields[2] = { name: 'Status:', value: 'Accepted' };
                  message.edit({ embeds: [embed.setColor('GREEN')] });
                  return interaction.reply({
                     content: 'Prop Accepted',
                     ephemeral: true,
                  });
                  break;
               }
               case 'no': {
                  embed.fields[2] = { name: 'Status:', value: 'Declined' };
                  message.edit({ embeds: [embed.setColor('RED')] });
                  return interaction.reply({
                     content: 'Prop Declined',
                     ephemeral: true,
                  });

                  break;
               }
               case 'abstain': {
                  embed.fields[2] = { name: 'Status:', value: 'Abstained' };
                  message.edit({ embeds: [embed.setColor('YELLOW')] });
                  return interaction.reply({
                     content: 'Prop Abstained',
                     ephemeral: true,
                  });

                  break;
               }
            }
         }
      );
   },
};
