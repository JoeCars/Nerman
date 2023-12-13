const {
   ModalBuilder,
   CommandInteraction,
   TextInputBuilder,
   TextInputStyle,
} = require('discord.js');

const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');
const GuildConfig = require('../../../db/schemas/GuildConfig');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

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
         guild,
         client: { guildConfigs },
         user: { id: userId },
         member: {
            permissions,
            roles: { cache: roleCache },
         },
         guild: {
            channels,
            id: guildId,
            roles: gRoles,
            roles: {
               cache: guildRoleCache,
               everyone: { id: everyoneId },
            },
         },
         memberPermissions,
      } = interaction;

      await authorizeInteraction(interaction, 2);

      if (!channel.isText()) {
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

      const modal = createPollChannelModal(roleOptions);

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

function createPollChannelModal(roleOptions) {
   let placeholder = [];
   roleOptions.forEach(({ label }) => placeholder.push(label));

   placeholder = placeholder.join(', ');

   if (placeholder.length > 100) {
      placeholder = placeholder.substring(0, 99);
   }

   const modal = new ModalBuilder()
      .setCustomId('modal-create-poll-channel')
      .setTitle('Create Polling Channel');

   const votingRoles = new TextInputBuilder()
      .setCustomId('votingRoles')
      .setLabel('Choose Voting Roles')
      .setPlaceholder(placeholder)
      .setValue(placeholder)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);

   const pollDuration = new TextInputBuilder()
      .setCustomId('pollDuration')
      .setLabel('Poll Duration (hours)')
      .setPlaceholder('Eg) 60')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(4)
      .setRequired(true);

   const maxProposals = new TextInputBuilder()
      .setCustomId('maxProposals')
      .setLabel('Max Active Polls Per User')
      .setPlaceholder(
         'Choose maximum number of active polls allowed per user with voting role.',
      )
      .setStyle(TextInputStyle.Short)
      .setMaxLength(3)
      .setRequired(true);

   const pollQuorum = new TextInputBuilder()
      .setCustomId('pollQuorumThreshold')
      .setLabel('Choose Quorum %')
      .setPlaceholder('Eg) 30.5')
      .setValue('30.5')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(15)
      .setRequired(true);

   const pollChannelOptions = new TextInputBuilder()
      .setCustomId('pollChannelOptions')
      .setLabel('Choose Channel Options (if any)')
      .setPlaceholder(
         'anonymous-voting, live-results, vote-allowance, for-or-against, nouns-dao, lil-nouns',
      )
      .setValue('anonymous-voting, live-results, for-or-against, nouns-dao')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100);

   modal.addComponents(
      votingRoles,
      pollDuration,
      maxProposals,
      pollQuorum,
      pollChannelOptions,
   );

   Logger.info(
      'commands/slashCommands/poll/createPollChannel.js: Created modal.',
   );

   return modal;
}
