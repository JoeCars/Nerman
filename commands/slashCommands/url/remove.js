const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');
const { authorizeInteraction } = require('../../../helpers/authorization');
const Logger = require('../../../helpers/logger');
const UrlConfig = require('../../../db/schemas/UrlConfig');

module.exports = {
   subCommand: 'nerman.url.remove',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/url/remove.js: Removing URL config.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );

      await authorizeInteraction(interaction, 2);

      let oldConfig;
      try {
         oldConfig = await UrlConfig.findOne({
            guildId: interaction.guildId,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slashCommands/url/remove.js: Unable to find config due to an error.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to remove the URL config due to a database error.',
         );
      }

      if (!oldConfig) {
         return interaction.reply({
            content:
               'This guild did not have any registered URL configs, so nothing was removed.',
            ephemeral: true,
         });
      }

      try {
         await UrlConfig.findOneAndRemove({
            _id: oldConfig._id,
            guildId: oldConfig.guildId,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slashCommands/url/remove.js: Unable to remove the config due to an error.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to remove the URL config due to a database error.',
         );
      }

      await interaction.reply({
         content: "Successfully removed this guild's URL config.",
         ephemeral: true,
      });

      Logger.info(
         'commands/slashCommands/url/remove.js: Finished removing URL config.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
