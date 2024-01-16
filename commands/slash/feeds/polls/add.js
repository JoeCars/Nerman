const { CommandInteraction } = require('discord.js');

const PollChannel = require('../../../../db/schemas/PollChannel');
const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const { formatResultMessage } = require('../../../../helpers/feeds');

module.exports = {
   subCommand: 'polls.add',

   async execute(interaction) {
      Logger.info('commands/slash/feeds/polls.js: Adding new feed.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
      });

      await authorizeInteraction(interaction, 2);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;
      const event = interaction.options.getString('event');

      const numOfChannels = await PollChannel.countDocuments({
         channelId: channel.id,
      }).exec();

      if (numOfChannels === 0) {
         return interaction.reply({
            content:
               'This feed can only be added to poll channels. Please create a poll channel first.',
            ephemeral: true,
         });
      }

      const eventResults = [];
      if (event === 'all') {
         const results = await FeedConfig.registerAllProjectFeeds(
            interaction.guildId,
            channel.id,
            'Polls',
         );
         eventResults.push(...results);
      } else {
         const results = await FeedConfig.registerFeed(
            interaction.guildId,
            channel.id,
            event,
         );
         eventResults.push(results);
      }

      const resultMessage = formatResultMessage(eventResults, channel);

      await interaction.reply({
         ephemeral: true,
         content: resultMessage,
      });

      Logger.info('commands/slash/feeds/polls.js: Finished adding new feed.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
      });
   },
};
