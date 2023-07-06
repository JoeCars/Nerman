const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');
const { inlineCode } = require('@discordjs/builders');

const FeedConfig = require('../../../db/schemas/FeedConfig');
const Logger = require('../../../helpers/logger');
const { isUserANermanDeveloper } = require('../../../helpers/authorization');
const events = require('../../../utils/feedEvents');

module.exports = {
   subCommand: 'nerman.feeds.remove',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/events/remove.js: Removing new event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      if (!isUserANermanDeveloper(interaction.user.id)) {
         throw new Error('This is an admin-only command');
      }

      const channel = interaction.options.getChannel('channel');
      const event = interaction.options.getString('event');

      if (!channel || !event) {
         throw new Error('The channel and event were not supplied.');
      }

      // Removing configuration.
      let config;
      try {
         config = await FeedConfig.findOneAndDelete({
            guildId: interaction.guildId,
            channelId: channel.id,
            eventName: event,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slashCommands/events/remove.js: Unable to remove the configuration.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to remove notification configuration due to a database issue.',
         );
      }

      const eventName = events.get(event);

      if (config) {
         await interaction.reply({
            ephemeral: true,
            content: `You have successfully remove the ${inlineCode(
               eventName,
            )} event from channel ${inlineCode(channel.id)}.`,
         });
      } else {
         await interaction.reply({
            ephemeral: true,
            content: `${inlineCode(
               eventName,
            )} was not registered to channel ${inlineCode(
               channel.id,
            )}. Nothing was removed.`,
         });
      }

      Logger.info(
         'commands/slashCommands/events/remove.js: Finished removing new event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            didNotExist: !config,
         },
      );
   },
};
