const { CommandInteraction, codeBlock, hyperlink } = require('discord.js');

const Logger = require('../../../helpers/logger');
const HouseFilterConfig = require('../../../db/schemas/HouseFilterConfig');

module.exports = {
   subCommand: 'nerman-houses.display',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slash/houses/display.js: Displaying channel permitted houses.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;

      let config;
      try {
         config = await HouseFilterConfig.findOne({
            guildId: interaction.guildId,
            channelId: channel.id,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slash/houses/display.js: Unable to retrieve HouseFilterConfig due to a database issue.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to register HouseFilterConfig due to a database issue.',
         );
      }

      if (!config) {
         await interaction.reply({
            content: codeBlock('This channel has no registered houses.'),
            ephemeral: true,
         });
      } else {
         let response = '';
         for (const house of config.permittedHouses) {
            response += hyperlink(house.name, house.url) + '\n';
         }

         await interaction.reply({
            content: response,
            ephemeral: true,
         });
      }

      Logger.info(
         'commands/slash/houses/display.js: Finished displaying channel permitted houses.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
