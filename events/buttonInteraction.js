const { ButtonInteraction } = require('discord.js');

module.exports = {
   name: 'interactionCreate',
   /**
    * @param {ButtonInteraction} interaction
    */
   execute(interaction) {
      if (!interaction.isButton()) return;

      console.log('buttonInteraction.js -- BUTTON INTERACTION');

      const {
         client,
         customId,
         member: { permissions },
      } = interaction;

      // check

      console.log('buttonInteraction.js -- customId', { customId });
      console.log('buttonInteraction.js -- permissions', { permissions });
      // console.log(client.buttons);
      // console.log(client.buttons.get(customId));

      const button = client.buttons.get(customId);

      console.log('buttonInteraction.js -- button', { button });

      if (button.permission && !permissions.has(button.permission)) {
         return interaction.reply({
            content: 'You lack the permissions to interact with this button',
            ephemeral: true,
         });
      }

      button.execute(interaction);
   },
};
