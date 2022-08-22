const { logToObject } = require('../utils/functions');

module.exports = {
   name: 'interactionCreate',
   async execute(interaction) {
      if (!interaction.isCommand()) return;

      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) return;

      try {
         // console.time('Interaction Timer');

         await command.execute(interaction);
         // console.timeEnd('Interaction Timer');
      } catch (error) {
         console.error(error);

         if (interaction.deferred) {
            console.log('INTERACTION CREATE DEFERRED');
            await interaction.editReply({
               content:
               error.message ||
               'There was an error while executing this command!',
               ephemeral: true,
            });
         } else {
            console.log('INTERACTION CREATE NOT DEFERRED');
            await interaction.reply({
               content:
                  error.message ||
                  'There was an error while executing this command!',
               ephemeral: true,
            });
         }
         console.timeEnd('Interaction Timer');
      }
   },
};
