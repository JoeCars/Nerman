const { CommandInteraction, inlineCode } = require('discord.js');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const events = require('../../../../utils/feedEvents');

module.exports = {
   subCommand: 'feeds.add-all',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('commands/slash/feeds/add-all.js: Adding all feeds.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
      });

      await authorizeInteraction(interaction, 2);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;

      await addAllFeeds(interaction, channel.id);

      Logger.info(
         'commands/slash/feeds/add-all.js: Finished adding all feeds.',
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
async function addAllFeeds(interaction, channelId) {
   const eventErrors = [];
   let numOfSuccesses = 0;

   // Inserting events.
   for (const [eventKey, eventValue] of events.entries()) {
      const eventGroup = eventValue.split('.')[0];

      // Polls require a poll channel, so keeping these event in would only cause errors.
      if (eventGroup === 'Poll') {
         continue;
      }

      try {
         await FeedConfig.tryAddFeed(interaction.guildId, channelId, eventKey);
         numOfSuccesses++;
      } catch (error) {
         Logger.error(
            'commands/slash/feeds/add-all.js: Unable to add feed.',
            {
               error: error,
               event: eventValue,
               channelId: channelId,
               guildId: interaction.guildId,
            },
         );
         eventErrors.push(eventValue);
      }
   }

   // Dealing with success.
   if (eventErrors.length === 0) {
      return interaction.reply({
         ephemeral: true,
         content: `Successfully added ${inlineCode(numOfSuccesses)} events!`,
      });
   }

   // Dealing with failure.
   let responseBody = `Unable to add ${inlineCode(eventErrors.length)} events.`;
   for (const eventName of eventErrors) {
      responseBody += `\n- ${inlineCode(eventName)}`;
   }
   responseBody += '\nPlease try again.';

   await interaction.reply({
      ephemeral: true,
      content: responseBody,
   });
}
