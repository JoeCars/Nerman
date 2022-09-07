const { SlashCommandBuilder } = require('@discordjs/builders');
const {
   Modal,
   TextInputComponent,
   SelectMenuComponent,
   CommandInteraction,
   showModal,
} = require('discord-modals');
const { isRequiredArgument } = require('graphql');

const Poll = require('../db/schemas/Poll');
const PollChannel = require('../db/schemas/PollChannel');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman')
      .setDescription('Nerman Global Command Prefix')
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-poll')
            .setDescription('Create a poll in the current channel.')
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-poll-channel')
            .setDescription('Create voting channel configuration.')
      ),
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      console.log(
         'interaction.options.getSubcommand',
         interaction.options.getSubcommand()
      );
      // console.log('INTERACTION', interaction);
      // console.log('ROLE CACHE', roleCache);
      // console.log('ROLE CACHE HAS??', roleCache.has(process.env.VOTER_DEV_ID));

      // console.log(foundPolls);

      // console.log('USER CREATED POLL AND IN THIS CHANNEL');
      // console.log('INTERACTION.CLIENT', interaction.client);

      if (interaction.options.getSubcommand() === 'create-poll') {
         const {
            channelId,
            user: { id: userId },
            member: {
               roles: { cache: roleCache },
            },
         } = interaction;

         if (!(await PollChannel.countDocuments({ channelId }))) {
            return interaction.reply({
               content:
                  'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
               ephemeral: true,
            });
         }

         const channelConfig = await PollChannel.findOne(
            { channelId },
            'maxUserProposal voteAllowance'
         ).exec();

         const countedPolls = await Poll.countDocuments({
            config: channelConfig._id,
            creatorId: userId,
            status: 'open',
         });

         if (countedPolls >= channelConfig.maxUserProposal) {
            return interaction.reply({
               content:
                  'You have exceeded the amount of allowed polls in this channel. You must wait until your current poll is closed.',
               ephemeral: true,
            });
         }

         // return interaction.reply({
         //    content: 'canceling this for testing purposes',
         //    ephemeral: true,
         // });
         // return interaction.reply({
         //    content: 'canceling this for testing purposes',
         //    ephemeral: true,
         // });

         const modal = new Modal()
            .setCustomId('modal-create-poll')
            .setTitle('Create Poll');

         // const channelOptions = channelConfigs.map(
         //    ({ channelId, channelName }) => ({
         //       label: channelName,
         //       value: channelId,
         //    })
         // );

         // console.log(channelOptions);

         // const pollType = new SelectMenuComponent()
         //    .setCustomId('pollType')
         //    .setPlaceholder('Select Poll Channel')
         //    .addOptions(channelOptions)
         //    .setMinValues(1)
         //    .setMaxValues(1);

         // console.log(pollType);

         // return interaction.reply({
         // content: 'canceling this for testing purposes',
         // ephemeral: true,
         // });
         const createPollComponents = [];

         const pollTitle = new TextInputComponent()
            .setCustomId('pollTitle')
            .setLabel('Title')
            .setPlaceholder('Poll title, or your main question.')
            .setStyle('SHORT')
            .setMaxLength(100)
            .setRequired(true);

         const pollDescription = new TextInputComponent()
            .setCustomId('pollDescription')
            .setLabel('Description')
            .setPlaceholder(
               'Descriptive text, links, and any supporting details needed for users to decide on your poll.'
            )
            .setStyle('LONG')
            .setMaxLength(2000)
            .setRequired(false);

         const pollChoices = new TextInputComponent()
            .setCustomId('pollChoices')
            .setLabel('Choices')
            .setPlaceholder(
               'Comma separated values. Minimum two options. eg) Yes, No, Abstain'
            )
            .setDefaultValue('Yes, No, Abstain')
            .setStyle('SHORT')
            .setMaxLength(100)
            .setRequired(true);

         createPollComponents.push(pollTitle, pollDescription, pollChoices);

         console.log(channelConfig.voteAllowance);

         if (channelConfig.voteAllowance) {
            const pollAllowance = new TextInputComponent()
               .setCustomId('voteAllowance')
               .setLabel('Votes Per User')
               .setPlaceholder('# of votes is a single user allowed.')
               .setDefaultValue('1')
               .setRequired(true)
               .setStyle('SHORT');

            createPollComponents.push(pollAllowance);
         }

         console.log({ createPollComponents });

         // modal.addComponents(pollType, pollTitle, pollDescription, pollChoices);
         modal.addComponents(createPollComponents);

         // console.log({ modal });
         // console.log(modal.components[1], modal.components[1].components[0]);

         await showModal(modal, {
            client: interaction.client,
            interaction: interaction,
         });
      }

      // ///////////////////////////////////////////////////////////
      // CREATE POLL CHANNEL
      // ///////////////////////////////////////////////////////////
      if (interaction.options.getSubcommand() === 'create-poll-channel') {
         // console.time('destruct');
         const {
            channelId,
            channel,
            guild,
            guild: {
               channels,
               roles: gRoles,
               roles: {
                  cache: guildRoleCache,
                  everyone: { id: everyoneId },
               },
            },
            user: { id: userId },
            member: {
               permissions,
               roles: { cache: roleCache },
            },
            memberPermissions,
         } = interaction;
         // console.timeEnd('destruct')'

         console.log(memberPermissions.has('MANAGE_GUILD'));
         console.log('commandInteraction -- create-poll', { channelId });
         // console.log('isTextBased', channel.isText());
         // console.log('isDMBased', channel.isDM());

         if (!memberPermissions.has('MANAGE_GUILD')) {
            return interaction.reply({
               content: 'Only guild managers have access to this.',
               ephemeral: true,
            });
         }

         if (!channel.isText())
            return interaction.reply({
               content:
                  'Polling can only be configured within text based channels.',
               ephemeral: true,
            });

         const configCheck = await PollChannel.countDocuments({
            channelId,
         });
         // console.log({ configCheck });

         // console.log(!!configCheck);
         // console.log(await PollChannel.countDocuments({ channelId }));

         if (!!configCheck)
            return interaction.reply({
               content:
                  'There already exists a configuration for this channel.',
               ephemeral: true,
            });

         // const channelConfigs = await PollChannel.find(
         //    {},
         //    'channelId channelName maxUserProposal'
         // );

         // Fetch all guild channels that are text channels and don't have an existing configuration
         // const guildChannels = await channels
         //    .fetch()
         //    .then(allChannels =>
         //       allChannels.filter(
         //          ({ type, id }) =>
         //             type === 'GUILD_TEXT' &&
         //             !channelConfigs.some(config => id === config.channelId)
         //       )
         //    )
         //    .catch(err => console.error(err));

         // console.log({ roles });
         // console.log({ roleCache });
         // console.log({ guild });
         // console.log({ channels });
         // console.log({ guildChannels });
         // console.log(channels.cache.get());
         // console.log({ interaction });
         // console.log({ channelConfigs });

         // if (!guildChannels) {
         //    return interaction.reply({
         //       content:
         //          'There are no available channels to create a new configuration for. Either there are no existing text channels, or they all have existing configurations. Existing configurations can be edited through context menu, but not overwritten by <Nerman create-poll-channel> command.',
         //       ephemeral: true,
         //    });
         // }

         // const channelOptions = guildChannels.map(({ id, name }) => ({
         //    label: name,
         //    value: id,
         // }));

         // console.log({ channelOptions });

         // const roleOptions = roleCache.map(({ id, name }) => ({
         //    label: name,
         //    value: id,
         // }));
         const roleOptions = await gRoles
            .fetch()
            .then(fetchedRoles =>
               fetchedRoles
                  .filter(({ managed }) => !managed)
                  .map(({ id, name }) => ({
                     label: name,
                     value: id,
                  }))
            )
            .catch(err => console.error(err));
         // const roleOptions = roleCache
         //    .filter(({ id }) => id !== everyoneId)
         //    .map(({ id, name }) => ({ label: name, value: id }));

         // console.log({ roleOptions });

         if (!roleOptions.length) {
            return interaction.reply({
               content:
                  'You must have at least one guild role in order to assign a voting role.',
               ephemeral: true,
            });
         }

         let placeholder = [];

         roleOptions.forEach(({ label }) => placeholder.push(label));

         placeholder = placeholder.join(', ');

         const modal = new Modal()
            .setCustomId('modal-create-poll-channel')
            .setTitle('Create Polling Channel');

         // const pollChannel = new SelectMenuComponent()
         //    .setCustomId('pollChannel')
         //    .setPlaceholder('Select Polling Channel')
         //    .addOptions(channelOptions)
         //    .setMinValues(1)
         //    .setMaxValues(1);

         // console.log({ pollChannel });

         console.log(roleOptions.length);

         const votingRoles = new TextInputComponent()
            .setCustomId('votingRoles')
            .setLabel('Choose Voting Roles')
            .setPlaceholder(placeholder)
            .setDefaultValue(placeholder)
            .setStyle('SHORT')
            .setMaxLength(100)
            .setRequired(true);
         //disabled until modals are supported
         // const votingRoles = new SelectMenuComponent()
         //    .setCustomId('votingRoles')
         //    .setPlaceholder('Allowed Voting Roles')
         //    .addOptions(roleOptions)
         //    .setMinValues(1)
         //    .setMaxValues(roleOptions.length);

         console.log({ votingRoles });

         // todo DURATION REGEX THEN PARSE- DURATION MAX OUT 999 hours
         const pollDuration = new TextInputComponent()
            .setCustomId('pollDuration')
            .setLabel('Poll Duration (hours)')
            .setPlaceholder('Eg) 60')
            .setStyle('SHORT')
            .setMaxLength(4)
            .setRequired(true);

         const maxProposals = new TextInputComponent()
            .setCustomId('maxProposals')
            .setLabel('Max Active Polls Per User')
            .setPlaceholder(
               'Choose maximum number of active polls allowed per user with voting role.'
            )
            .setStyle('SHORT')
            .setMaxLength(3)
            .setRequired(true);

         const pollQuorum = new TextInputComponent()
            .setCustomId('pollQuorum')
            .setLabel('Choose Quorum %')
            .setPlaceholder('10%')
            .setStyle('SHORT')
            .setMaxLength(6)
            .setRequired(true);

         const pollChannelOptions = new TextInputComponent()
            .setCustomId('pollChannelOptions')
            .setLabel('Choose Channel Options (if any)')
            .setPlaceholder('anonymous-voting, live-results, vote-allowance')
            .setDefaultValue('anonymous-voting, live-results, vote-allowance')
            .setStyle('SHORT')
            .setMaxLength(50);

         // disabled until DJS add back support for SelectMenus in Modals
         // const pollChannelOptions = new SelectMenuComponent()
         //    .setCustomId('pollChannelOptions')
         //    .setPlaceholder('Select Channel Options (if any)')
         //    .addOptions(
         //       {
         //          label: 'Anonymous Voting',
         //          value: 'anonymous-voting',
         //          description:
         //             'Only participation is recorded, results are anonymous.',
         //       },
         //       {
         //          label: 'Live Results',
         //          value: 'live-results',
         //          description:
         //             'Display visual feed of results as polling occurs.',
         //       },
         //       {
         //          label: 'Vote Allowance',
         //          value: 'vote-allowance',
         //          description:
         //             'Enables custom vote allowance # on create-poll command.',
         //       }
         //    )
         //    .setMinValues(0)
         //    .setMaxValues(3);

         modal.addComponents(
            // pollChannel,
            votingRoles,
            pollDuration,
            maxProposals,
            pollQuorum,
            pollChannelOptions
         );

         await showModal(modal, {
            client: interaction.client,
            interaction: interaction,
         });
      }
   },
};
