const { ButtonInteraction } = require('discord.js');

module.exports = {
   name: 'interactionCreate',
   /**
    * @param {ButtonInteraction} interaction
    */
   execute(interaction) {
      if (!interaction.isButton()) return;

      console.log('BUTTON INTERACTION')

      const {
         client,
         customId,
         member: { permissions },
      } = interaction;

      console.log({ customId });
      // console.log(client.buttons);
      // console.log(client.buttons.get(customId));

      const button = client.buttons.get(customId);

      console.log({ button });

      if (button.permission && !permissions.has(button.permission)) {
         return interaction.reply({
            content: 'You lack the permissions to interact with this button',
            ephemeral: true,
         });
      }

      button.execute(interaction);
   },
};
