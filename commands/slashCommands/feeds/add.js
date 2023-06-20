const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');

const FeedConfig = require('../../../db/schemas/FeedConfig');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman.notification-add',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/events/add.js: Adding new event configuration.',
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

      // Checking for previous configuration.
      let numOfConfigs;
      try {
         numOfConfigs = await FeedConfig.countDocuments({
            guildId: interaction.guildId,
            channelId: channel.id,
            eventName: event,
         });
      } catch (error) {
         Logger.error(
            'commands/slashCommands/events/add.js: Unable to search for duplicate.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to add notification configuration due to a database issue.',
         );
      }

      if (numOfConfigs !== 0) {
         interaction.reply({
            ephemeral: true,
            content: 'This event is already registered to this channel.',
         });
         return;
      }

      // Inserting new configuration.
      try {
         FeedConfig.create({
            _id: new Types.ObjectId(),
            guildId: interaction.guildId,
            channelId: channel.id,
            eventName: event,
         });
      } catch (error) {
         Logger.error(
            'commands/slashCommands/events/add.js: Unable to save the configuration.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to add notification configuration due to a database issue.',
         );
      }

      await interaction.reply({
         ephemeral: true,
         content: `You have successfully registered the ${event} event to ${channel.id}.`,
      });

      Logger.info(
         'commands/slashCommands/events/add.js: Finished adding new event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};
