const { CommandInteraction, userMention } = require('discord.js');
const { Types } = require('mongoose');

const Admin = require('../../../db/schemas/Admin');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman-admin.add',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('commands/slashCommands/admin/add.js: Adding a new admin.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
      });

      await authorizeInteraction(interaction, 3);

      const newAdmin = interaction.options.getUser('user');

      if (!newAdmin) {
         throw new Error('The user was not supplied.');
      }

      // Checking for a previously added admin.
      let numOfConfigs;
      try {
         numOfConfigs = await Admin.countDocuments({
            guildId: interaction.guildId,
            userId: newAdmin.id,
         });
      } catch (error) {
         Logger.error(
            'commands/slashCommands/admin/add.js: Unable to search for duplicate.',
            {
               error: error,
            },
         );
         throw new Error('Unable to add new admin due to a database issue.');
      }

      if (numOfConfigs !== 0) {
         return interaction.reply({
            ephemeral: true,
            content:
               'This user is already registered as an admin in this guild.',
         });
      }

      // Inserting new configuration.
      try {
         Admin.create({
            _id: new Types.ObjectId(),
            guildId: interaction.guildId,
            userId: newAdmin.id,
         });
      } catch (error) {
         Logger.error(
            'commands/slashCommands/admin/add.js: Unable to save the new admin.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to add the new admin due to a database issue.',
         );
      }

      await interaction.reply({
         ephemeral: true,
         content: `You have successfully added ${userMention(
            newAdmin.id,
         )} as a new admin.`,
      });

      Logger.info(
         'commands/slashCommands/admin/add.js: Finished adding new admin.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
         },
      );
   },
};
