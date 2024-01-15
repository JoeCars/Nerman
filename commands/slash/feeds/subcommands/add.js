const { CommandInteraction, inlineCode } = require('discord.js');
const { Types } = require('mongoose');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const events = require('../../../../utils/feedEvents');

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

      try {
         const numOfConfigs = await FeedConfig.countDocuments({
            guildId: interaction.guildId,
            channelId: channel.id,
            eventName: event,
            isDeleted: {
               $ne: true,
            },
         });

         if (numOfConfigs !== 0) {
            return interaction.reply({
               ephemeral: true,
               content: 'This event is already registered to this channel.',
            });
         }

         await FeedConfig.create({
            _id: new Types.ObjectId(),
            guildId: interaction.guildId,
            channelId: channel.id,
            eventName: event,
         });

         const eventName = events.get(event);

         return await interaction.reply({
            ephemeral: true,
            content: `You have successfully registered the ${inlineCode(
               eventName,
            )} event to channel ${inlineCode(channel.id)}.`,
         });
      } catch (error) {
         Logger.error(
            'commands/slash/feeds/add.js: Unable to save the configuration.',
            {
               error: error,
            },
         );
         throw new Error('Unable to add feed due to a database issue.');
      }
   },
};
