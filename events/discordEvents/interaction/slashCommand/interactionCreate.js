const { logToObject } = require('../../../../utils/functions');
const { log: l } = console;

// todo I should probably split this so that slash commands and context menu commands are housed in separate places.
module.exports = {
   name: 'interactionCreate',
   async execute(interaction) {
      if (!interaction.isCommand() && !interaction.isContextMenu()) return;

      l('interaction.isCommand() => ', interaction.isCommand());
      l('interaction.isContextMenu() => ', interaction.isContextMenu());

      const { client } = interaction;

      const command = client.commands.get(interaction.commandName);

      if (!command) return;
      // console.log({ interaction });
      console.log(interaction.options);
      // console.log(interaction.options.getSubcommand() ?? 'No subcommands');
      const subCommand = interaction.options?.getSubcommand(false);

      console.log({ subCommand });

      try {
         if (subCommand) {
            const subCommandFile = client.subCommands.get(
               `${interaction.commandName}.${subCommand}`
            );

            l(client.subCommands);

            if (!subCommandFile) {
               throw Error('Invalid subcommand');
            }

            await subCommandFile.execute(interaction);
         }

         await command.execute(interaction);
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
            console.log('INTERACTION CREATE NOTDEFERRED');
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
