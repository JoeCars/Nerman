const { CommandInteraction, inlineCode, hyperlink } = require('discord.js');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const events = require('../../../../utils/feedEvents');

module.exports = {
   subCommand: 'feeds.display',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('commands/slash/feeds/display.js: Displaying feeds.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
      });

      await authorizeInteraction(interaction, 1);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;

      // Grabbing configuration.
      let feedConfigs;
      try {
         feedConfigs = await FeedConfig.findFeedsInChannel(
            interaction.guildId,
            channel.id,
         );
      } catch (error) {
         Logger.error(
            'commands/slash/feeds/remove.js: Unable to find the feed.',
            {
               error: error,
            },
         );
         throw new Error('Unable to find feeds.');
      }

      await interaction.reply({
         ephemeral: true,
         content: generateFeedDisplay(feedConfigs),
      });

      Logger.info(
         'commands/slash/feeds/display.js: Finished displaying feeds.',
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
         let output = '- ' + inlineCode(events.get(config.eventName));
         return output;
      })
      .join('\n');
}
