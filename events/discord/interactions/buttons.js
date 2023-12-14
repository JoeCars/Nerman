const { ButtonInteraction } = require('discord.js');

const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'interactionCreate',
   /**
    * @param {ButtonInteraction} interaction
    */
   execute(interaction) {
      if (!interaction.isButton()) {
         return;
      }

      Logger.info('events/discord/buttons.js: Handling a button interaction.', {
         customId: interaction.customId,
         memberPermissions: interaction.member.permissions,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
         userId: interaction.user.id,
      });

      const {
         client,
         customId,
         member: { permissions },
      } = interaction;

      const button = client.buttons.get(customId);

      if (button.permission && !permissions.has(button.permission)) {
         Logger.warn(
            'events/discord/buttons.js: User does not have the permissions to interact with this button.',
            {
               customId: interaction.customId,
               memberPermissions: interaction.member.permissions,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
               userId: interaction.user.id,
            },
         );

         return interaction.reply({
            content: 'You lack the permissions to interact with this button',
            ephemeral: true,
         });
      }

      button.execute(interaction);

      Logger.info(
         'events/discord/buttons.js: Finished handling a button interaction.',
         {
            customId: interaction.customId,
            memberPermissions: interaction.member.permissions,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
