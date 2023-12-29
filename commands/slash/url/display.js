const { CommandInteraction, codeBlock } = require('discord.js');

const Logger = require('../../../helpers/logger');
const UrlConfig = require('../../../db/schemas/UrlConfig');

module.exports = {
   subCommand: 'nerman-url.display',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/url/display.js: Displaying guild URLs.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );

      let config;
      try {
         config = await UrlConfig.findOne({
            guildId: interaction.guildId,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slashCommands/url/display.js: Unable to display config due to a database issue.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to display the guild URLs due to a database issue.',
         );
      }

      if (!config) {
         await interaction.reply({
            content: codeBlock('This guild has no URL configuration.'),
            ephemeral: true,
         });
      } else {
         const response = `Proposal URL: ${config.propUrl}\nNoun URL: ${config.nounUrl}`;
         await interaction.reply({
            content: codeBlock(response),
            ephemeral: true,
         });
      }

      Logger.info(
         'commands/slashCommands/url/display.js: Finished displaying guild URLs.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
