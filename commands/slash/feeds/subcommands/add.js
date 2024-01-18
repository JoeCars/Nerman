const { CommandInteraction, inlineCode } = require('discord.js');
const { Types } = require('mongoose');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { getKeyOfEvent } = require('../../../../helpers/feeds');
const { authorizeInteraction } = require('../../../../helpers/authorization');

module.exports = {
   subCommand: 'feeds.add',
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
      const eventKey = getKeyOfEvent(event);

      const result = await FeedConfig.registerFeed(
         interaction.guildId,
         channel.id,
         eventKey,
      );

      if (result.isDuplicate) {
         return interaction.reply({
            ephemeral: true,
            content: 'This event is already registered to this channel.',
         });
      } else {
         return interaction.reply({
            ephemeral: true,
            content: `You have successfully registered the ${inlineCode(
               event,
            )} event to channel ${inlineCode(channel.id)}.`,
         });
      }
   },
};
