const { CommandInteraction } = require('discord.js');
const { memberNicknameMention } = require('@discordjs/builders');

const Admin = require('../../../db/schemas/Admin');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman-admin.remove',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('commands/slashCommands/admin/add.js: Removing an admin.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
      });

      await authorizeInteraction(interaction, 3);

      const removedAdmin = interaction.options.getUser('user');

      if (!removedAdmin) {
         throw new Error('The user was not supplied.');
      }

      // Removing configuration.
      let config;
      try {
         config = await Admin.findOneAndDelete({
            guildId: interaction.guildId,
            userId: removedAdmin.id,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slashCommands/admin/remove.js: Unable to remove the admin.',
            {
               error: error,
            },
         );
         throw new Error('Unable to remove the admin due to a database issue.');
      }

      if (config) {
         await interaction.reply({
            ephemeral: true,
            content: `You have successfully removed ${memberNicknameMention(
               removedAdmin.id,
            )} as an admin.`,
         });
      } else {
         await interaction.reply({
            ephemeral: true,
            content: `${memberNicknameMention(
               removedAdmin.id,
            )} was not registered as an admin. Nothing was changed.`,
         });
      }

      Logger.info(
         'commands/slashCommands/admin/remove.js: Finished removing admin.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            didNotExist: !config,
         },
      );
   },
};
