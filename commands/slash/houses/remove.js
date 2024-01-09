const { CommandInteraction } = require('discord.js');
const { authorizeInteraction } = require('../../../helpers/authorization');
const Logger = require('../../../helpers/logger');
const HouseFilterConfig = require('../../../db/schemas/HouseFilterConfig');

module.exports = {
   subCommand: 'nerman-url.remove',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('commands/slash/houses/remove.js: Removing house config.', {
         guildId: interaction.guildId,
         channelId: interaction.channelId,
         userId: interaction.user.id,
      });

      await authorizeInteraction(interaction, 2);

      try {
         const channel =
            interaction.options.getChannel('channel') ?? interaction.channel;

         const oldConfig = await HouseFilterConfig.findOne({
            guildId: interaction.guildId,
            channelId: channel.id,
         }).exec();

         if (!oldConfig) {
            return interaction.reply({
               content:
                  'This channel did not have any registered house configs, so nothing was removed.',
               ephemeral: true,
            });
         }

         await HouseFilterConfig.findOneAndRemove({
            _id: oldConfig._id,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slash/houses/remove.js: Unable to remove the config due to an error.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to remove the House config due to a database error.',
         );
      }

      await interaction.reply({
         content: "Successfully removed this channel's house config.",
         ephemeral: true,
      });

      Logger.info('commands/slash/houses/remove.js: Finished house config.', {
         guildId: interaction.guildId,
         channelId: interaction.channelId,
         userId: interaction.user.id,
      });
   },
};
