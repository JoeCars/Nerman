const { CommandInteraction } = require('discord.js');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const { formatResultMessage } = require('../../../../helpers/feeds');

module.exports = {
   subCommand: 'federation.add',

   async execute(interaction) {
      Logger.info('commands/slash/feeds/federation.js: Adding new feed.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
      });

      await authorizeInteraction(interaction, 2);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;
      const event = interaction.options.getString('event');

      const eventResults = [];
      if (event === 'all') {
         const results = await FeedConfig.registerAllProjectFeeds(
            interaction.guildId,
            channel.id,
            'Federation',
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

      Logger.info(
         'commands/slash/feeds/federation.js: Finished adding new feed.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};
