const { ModalSubmitInteraction } = require('discord.js');

const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'interactionCreate',
   /**
    * @param {ModalSubmitInteraction} interaction
    */
   execute(interaction) {
      if (!interaction.isModalSubmit()) {
         return;
      }

      Logger.info(
         'events/interactions/modals.js: Handling a modal interaction.',
         {
            customId: interaction.customId,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );

      const { client, customId } = interaction;

      let modalId = customId;
      if (customId.includes('cancel-modal')) {
         modalId = 'cancel-modal';
      }
      const modalCommand = client.commands.get(modalId);

      modalCommand.execute(interaction);

      Logger.info(
         'events/interactions/modals.js: Finished handling a modal interaction.',
         {
            customId: interaction.customId,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
