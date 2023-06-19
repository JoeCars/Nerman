const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');
const { codeBlock } = require('@discordjs/builders');

const EventConfig = require('../../../db/schemas/EventConfig');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman.notification-display',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/events/display.js: Displaying event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      if (!isUserAuthorized(interaction.user.id)) {
         throw new Error('This is an admin-only command');
      }

      const channel = interaction.options.getChannel('channel');

      if (!channel) {
         throw new Error('The channel was not supplied.');
      }

      // Grabbing configuration.
      let eventConfigs;
      try {
         eventConfigs = await EventConfig.findEventsInChannel(
            interaction.guildId,
            channel.id,
         );
      } catch (error) {
         Logger.error(
            'commands/slashCommands/events/remove.js: Unable to find the configurations.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to find notification configurations due to a database issue.',
         );
      }

      await interaction.reply({
         ephemeral: true,
         content: codeBlock(generateEventDisplay(eventConfigs)),
      });

      Logger.info(
         'commands/slashCommands/events/display.js: Finished displaying new event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};

/**
 * @param {Array} eventConfigs
 */
function generateEventDisplay(eventConfigs) {
   if (eventConfigs.length === 0) {
      return 'This channel has no event configurations.';
   }

   return eventConfigs
      .map(config => {
         return config.eventName;
      })
      .join('\n');
}
