const { CommandInteraction } = require('discord.js');
const { memberNicknameMention } = require('@discordjs/builders');

const Admin = require('../../../db/schemas/Admin');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman.admin.display',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/admin/display.js: Displaying guild admins.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
         },
      );

      if (!isUserAuthorized(interaction.user.id)) {
         throw new Error('This is an admin-only command');
      }

      // Grabbing admins.
      let admins;
      try {
         admins = await Admin.find({
            guildId: interaction.guildId,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slashCommands/admin/display.js: Unable to find the admins.',
            {
               error: error,
            },
         );
         throw new Error('Unable to find admins due to a database issue.');
      }

      await interaction.reply({
         ephemeral: true,
         content: generateAdminDisplay(admins),
      });

      Logger.info(
         'commands/slashCommands/admin/dsiplay.js: Finished displaying admins',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
         },
      );
   },
};

/**
 * @param {Array} admins
 */
function generateAdminDisplay(admins) {
   if (admins.length === 0) {
      return 'This guild has no registered admins.';
   }

   return admins
      .map(admin => {
         return memberNicknameMention(admin.userId);
      })
      .join('\n');
}
