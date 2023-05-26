const Logger = require('../helpers/logger');

// todo I should probably split this so that slash commands and context menu commands are housed in separate places.
module.exports = {
   name: 'interactionCreate',
   async execute(interaction) {
      if (!interaction.isCommand() && !interaction.isContextMenu()) return;

      Logger.info(
         'events/interactionCreate.js: Handling an interaction creation event.',
         {
            interaction: interaction,
         }
      );

      const { client } = interaction;

      const command = client.commands.get(interaction.commandName);

      if (!command) return;
      // console.log(interaction.options.getSubcommand() ?? 'No subcommands');
      const subCommand = interaction.options?.getSubcommand(false);

      Logger.debug('events/interactionCreate.js: Checking subcommands.', {
         interaction: interaction,
         subCommand: subCommand,
      });

      try {
         if (subCommand) {
            const subCommandFile = client.subCommands.get(
               `${interaction.commandName}.${subCommand}`
            );

            if (!subCommandFile) {
               throw Error('Invalid subcommand');
            }

            await subCommandFile.execute(interaction);
         }

         Logger.info(
            'events/interactionCreate.js: Finished handling an interaction creation event.',
            {
               interaction: interaction,
            }
         );

         await command.execute(interaction);
      } catch (error) {
         Logger.warn(
            'events/interactionCreate.js: Encountered an error. Attempting to defer.',
            {
               error: error,
            }
         );

         if (interaction.deferred) {
            Logger.info('events/interactionCreate.js: Deferred interaction.', {
               interaction: interaction,
            });
            await interaction.editReply({
               content:
                  error.message ||
                  'There was an error while executing this command!',
               ephemeral: true,
            });
         } else {
            Logger.info(
               'events/interactionCreate.js: Did not defer interaction.',
               {
                  interaction: interaction,
               }
            );
            await interaction.reply({
               content:
                  error.message ||
                  'There was an error while executing this command!',
               ephemeral: true,
            });
         }
      }
   },
};
