const { CommandInteraction, codeBlock } = require('discord.js');
const { Types } = require('mongoose');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const events = require('../../../../utils/feedEvents');

module.exports = {
   subCommand: 'nerman-feeds.display',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/feeds/display.js: Displaying event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      await authorizeInteraction(interaction, 1);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;

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
            'commands/slashCommands/feeds/remove.js: Unable to find the configurations.',
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
         'commands/slashCommands/feeds/display.js: Finished displaying new event configuration.',
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
         let output = events.get(config.eventName);
         if (config.options?.prophouse?.permittedHouses?.length > 0) {
            output +=
               '(' +
               config.options.prophouse.permittedHouses
                  .map(house => house.name)
                  .join(',') +
               ')';
         }
         return output;
      })
      .join('\n');
}
