const Logger = require('../../../../helpers/logger');
const { CommandInteraction } = require('discord.js');

module.exports = {
   name: 'interactionCreate',
   /**
    *
    * @param {CommandInteraction} interaction
    * @returns
    */
   async execute(interaction) {
      if (!interaction.isCommand() && !interaction.isContextMenu()) return;

      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      let commandName = interaction.commandName;

      const subCommand = interaction.options?.getSubcommand(false);

      try {
         if (subCommand) {
            commandName += `${interaction.commandName}.${subCommand}`;
            const subCommandGroup =
               interaction.options.getSubcommandGroup(false);
            if (subCommandGroup) {
               commandName = `${interaction.commandName}.${subCommandGroup}.${subCommand}`;
            }

            const subCommandFile =
               interaction.client.subCommands.get(commandName);
            if (!subCommandFile) {
               throw Error('Invalid subcommand');
            }

            await subCommandFile.execute(interaction);
         }

         await command.execute(interaction);

         Logger.info(
            'events/interactionCreate.js: Finished executing interaction command.',
            {
               commandName: commandName,
               channelId: interaction.channelId,
               guildId: interaction.guildId,
               userId: interaction.user.id,
            },
         );
      } catch (error) {
         Logger.warn(
            'events/interactionCreate.js: Encountered an error. Attempting to defer.',
            {
               error: error,
            },
         );

         if (interaction.deferred) {
            await interaction.editReply({
               content:
                  error.message ||
                  'There was an error while executing this command!',
               ephemeral: true,
            });
         } else {
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
