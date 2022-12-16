const { CommandInteraction } = require('discord.js');
const { Modal, TextInputComponent, showModal } = require('discord-modals');
const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');
// const PollChannel = require('../../db/schemas/PollChannelCount')
module.exports = {
   subCommand: 'nerman.create-poll',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const {
         channelId,
         client,
         user: { id: userId },
         member: {
            roles: { cache: roleCache },
         },
         memberPermissions,
      } = interaction;

      // console.log('STATE OF NOUNS FROM SUBCOMMAND CREATEPOLL\n', stateOfNouns);

      const configExists = await PollChannel.configExists(channelId);

      console.log('CREATE', { configExists });

      // Test existence of channel configuration
      if (!configExists) {
         // throw new Error('Testing this error throw nonsense');
         return interaction.reply({
            content:
               'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
            ephemeral: true,
         });
      }

      // Actually retrieve configuration
      const channelConfig = await PollChannel.findOne(
         { channelId },
         'maxUserProposal voteAllowance'
      ).exec();

      const countedPolls = await Poll.countDocuments({
         config: channelConfig._id,
         creatorId: userId,
         status: 'open',
      });

      // console.log(memberPermissions.toArray());

      if (
         !memberPermissions.has('MANAGE_GUILD') &&
         countedPolls >= channelConfig.maxUserProposal
      ) {
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

      console.log({ modal });

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
         .setDefaultValue('Yes, No')
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

      console.log({ modal });

      // console.log({ modal });
      // console.log(modal.components[1], modal.components[1].components[0]);

      await showModal(modal, {
         client: client,
         interaction: interaction,
      });
      // console.log({ interaction });

      // return await interaction.reply({
      // content: 'This is nerman2 create-poll',
      // ephemeral: true,
      // });
   },
};
