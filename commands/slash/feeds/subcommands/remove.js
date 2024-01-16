const { CommandInteraction, inlineCode } = require('discord.js');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const { getKeyOfEvent } = require('../../../../helpers/feeds');

module.exports = {
   subCommand: 'feeds.remove',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slash/feeds/remove.js: Removing event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      await authorizeInteraction(interaction, 2);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;
      const event = interaction.options.getString('event');

      await removeFeed(interaction, channel.id, event);

      Logger.info(
         'commands/slash/feeds/remove.js: Finished removing event configuration.',
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
async function removeFeed(interaction, channelId, event) {
   const eventKey = getKeyOfEvent(event);

   let result;
   try {
      result = await FeedConfig.deleteOne({
         guildId: interaction.guildId,
         channelId: channelId,
         eventName: eventKey,
         isDeleted: {
            $ne: true,
         },
      });
   } catch (error) {
      Logger.error(
         'commands/slash/feeds/remove.js: Unable to remove the feed.',
         {
            error: error,
         },
      );
      throw new Error('Unable to remove the feed due to a database issue.');
   }

   if (!result) {
      return interaction.reply({
         ephemeral: true,
         content: `Something's gone wrong! Sorry about that.`,
      });
   }

   if (result.deletedCount === 0) {
      return interaction.reply({
         ephemeral: true,
         content: `${inlineCode(event)} was not registered in ${inlineCode(
            channelId,
         )}. Please try a different event.`,
      });
   }

   await interaction.reply({
      ephemeral: true,
      content: `You have successfully removed ${inlineCode(
         event,
      )} events from channel ${inlineCode(channelId)}.`,
   });
}
