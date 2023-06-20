const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');
const { codeBlock } = require('@discordjs/builders');

const FeedConfig = require('../../../db/schemas/FeedConfig');
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
      let feedConfigs;
      try {
         feedConfigs = await FeedConfig.findFeedsInChannel(
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
         content: codeBlock(generateFeedDisplay(feedConfigs)),
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
 * @param {Array} feedConfigs
 */
function generateFeedDisplay(feedConfigs) {
   if (feedConfigs.length === 0) {
      return 'This channel has no feed configurations.';
   }

   return feedConfigs
      .map(config => {
         return config.eventName;
      })
      .join('\n');
}
