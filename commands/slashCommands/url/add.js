const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');
const UrlConfig = require('../../../db/schemas/UrlConfig');

module.exports = {
   subCommand: 'nerman-url.add',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/url/add.js: Adding URLs to this guild.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );

      await authorizeInteraction(interaction, 2);

      let urlConfig;
      try {
         urlConfig = await UrlConfig.findOne({
            guildId: interaction.guildId,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slashCommands/url/add.js: Unable to retrieve UrlConfig due to a database issue.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to register UrlConfig due to a database issue.',
         );
      }

      if (urlConfig) {
         return interaction.reply({
            content:
               'Unable to register URLs for this guild, because it already has registered URLs.\nPlease remove the current URLs before trying to add new ones.',
            ephemeral: true,
         });
      }

      const propUrl =
         interaction.options.getString('proposal-url') ?? undefined;
      const nounUrl = interaction.options.getString('noun-url') ?? undefined;

      let newConfig;
      try {
         newConfig = await UrlConfig.create({
            _id: new Types.ObjectId(),
            guildId: interaction.guildId,
            propUrl: propUrl,
            nounUrl: nounUrl,
         });
      } catch (error) {
         Logger.error(
            'commands/slashCommands/url/add.js: Unable to register UrlConfig due to a database issue.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to register UrlConfig due to a database issue.',
         );
      }

      await interaction.reply({
         content: 'Successfully registered URLs to this guild.',
         ephemeral: true,
      });

      Logger.info(
         'commands/slashCommands/url/add.js: Finished adding URLs to this guild.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
            propUrl: newConfig.propUrl,
            nounUrl: newConfig.nounUrl,
         },
      );
   },
};
