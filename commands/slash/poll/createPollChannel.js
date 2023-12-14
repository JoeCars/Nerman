const { CommandInteraction, ChannelType } = require('discord.js');

const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');
const { generatePollChannelModal } = require('../../../views/modals');

module.exports = {
   subCommand: 'nerman.create-poll-channel',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/createPollChannel.js: Starting to create poll channel.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      const {
         channelId,
         channel,
         client: { guildConfigs },
         guild: { id: guildId, roles: gRoles },
      } = interaction;

      await authorizeInteraction(interaction, 2);

      if (channel.type !== ChannelType.GuildText) {
         return interaction.reply({
            content:
               'Polling can only be configured within text based channels.',
            ephemeral: true,
         });
      }

      const guildConfig = await guildConfigs.has(guildId);
      if (!guildConfig) {
         throw new Error(
            'There is not yet a configuration file for this guild.',
         );
      }

      const channelConfig = await PollChannel.configExists(channelId);
      if (channelConfig) {
         return interaction.reply({
            content: 'There already exists a configuration for this channel.',
            ephemeral: true,
         });
      }

      const roleOptions = await gRoles
         .fetch()
         .then(fetchedRoles =>
            fetchedRoles
               .filter(({ managed }) => !managed)
               .map(({ id, name }) => ({
                  label: name,
                  value: id,
               })),
         )
         .catch(err => {
            Logger.error(
               'commands/nerman/poll/createPollChannel.js: Received an error.',
               {
                  error: err,
               },
            );
         });

      if (!roleOptions.length) {
         return interaction.reply({
            content:
               'You must have at least one guild role in order to assign a voting role.',
            ephemeral: true,
         });
      }

      const modal = generatePollChannelModal(roleOptions);

      await interaction.showModal(modal.toJSON());

      Logger.info(
         'commands/nerman/poll/createPollChannel.js: Finished creating poll channel.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};
