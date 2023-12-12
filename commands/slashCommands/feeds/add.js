const { CommandInteraction, inlineCode } = require('discord.js');
const { Types } = require('mongoose');

const FeedConfig = require('../../../db/schemas/FeedConfig');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');
const events = require('../../../utils/feedEvents');

module.exports = {
   subCommand: 'nerman.feeds.add',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slashCommands/feeds/add.js: Adding new event configuration.',
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
            isDeleted: {
               $ne: true,
            },
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
            'commands/slashCommands/feeds/add.js: Unable to save the configuration.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to add notification configuration due to a database issue.',
         );
      }

      const eventName = events.get(event);

      await interaction.reply({
         ephemeral: true,
         content: `You have successfully registered the ${inlineCode(
            eventName,
         )} event to channel ${inlineCode(channel.id)}.`,
      });

      Logger.info(
         'commands/slashCommands/feeds/add.js: Finished adding new event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};
