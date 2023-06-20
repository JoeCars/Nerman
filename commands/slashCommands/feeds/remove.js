const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');

const FeedConfig = require('../../../db/schemas/FeedConfig');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman.notification-remove',
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

      if (!isUserAuthorized(interaction.user.id)) {
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

      if (config) {
         await interaction.reply({
            ephemeral: true,
            content: `You have successfully remove the ${event} event from ${channel.id}.`,
         });
      } else {
         await interaction.reply({
            ephemeral: true,
            content: `${event} was not registered to ${channel.id}. Nothing was removed.`,
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
