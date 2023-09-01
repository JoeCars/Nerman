const { CommandInteraction } = require('discord.js');
const { inlineCode } = require('@discordjs/builders');

const FeedConfig = require('../../../db/schemas/FeedConfig');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');
const events = require('../../../utils/feedEvents');

module.exports = {
   subCommand: 'nerman.feeds.remove-all',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/feeds/removeAll.js: Removing all event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      await authorizeInteraction(interaction, 2);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;

      if (!channel) {
         throw new Error('Could not retrieve channel for removal.');
      }

      await removeAllFeeds(interaction, channel.id);

      Logger.info(
         'commands/slashCommands/feeds/removeAll.js: Finished removing all event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};

/**
 * @param {CommandInteraction} interaction
 * @param {string} channelId
 */
async function removeAllFeeds(interaction, channelId) {
   let result;
   try {
      result = await FeedConfig.deleteMany({
         guildId: interaction.guildId,
         channelId: channelId,
         isDeleted: {
            $ne: true,
         },
      });
   } catch (error) {
      Logger.error(
         'commands/slashCommands/feeds/remove.js: Unable to remove the configuration.',
         {
            error: error,
         },
      );
      throw new Error(
         'Unable to remove notification configuration due to a database issue.',
      );
   }

   if (!result) {
      return interaction.reply({
         ephemeral: true,
         content: `Something's gone wrong! Sorry about that.`,
      });
   }

   await interaction.reply({
      ephemeral: true,
      content: `You have successfully removed ${inlineCode(
         result.deletedCount,
      )} events from channel ${inlineCode(channelId)}.`,
   });
}
