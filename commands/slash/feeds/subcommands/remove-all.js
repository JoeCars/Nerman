const { CommandInteraction, inlineCode } = require('discord.js');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');

module.exports = {
   subCommand: 'feeds.remove-all',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('commands/slash/feeds/remove-all.js: Removing all feeds.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
      });

      await authorizeInteraction(interaction, 2);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;

      if (!channel) {
         throw new Error('Could not retrieve channel for removal.');
      }

      await removeAllFeeds(interaction, channel.id);

      Logger.info(
         'commands/slash/feeds/remove-all.js: Finished removing all feeds.',
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
         'commands/slash/feeds/remove.js: Unable to remove the feeds.',
         {
            error: error,
         },
      );
      throw new Error('Unable to remove feeds due to a database issue.');
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
