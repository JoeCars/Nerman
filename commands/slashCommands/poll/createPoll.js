const { CommandInteraction } = require('discord.js');
const { Modal, TextInputComponent, showModal } = require('discord-modals');
const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman.create-poll',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/createPoll.js: Starting to create polls.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      const {
         channelId,
         client,
         user: { id: userId },
         member: {
            roles: { cache: roleCache },
         },
         memberPermissions,
      } = interaction;

      const configExists = await PollChannel.configExists(channelId);

      // Test existence of channel configuration
      if (!configExists) {
         return interaction.reply({
            content:
               'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
            ephemeral: true,
         });
      }

      // Actually retrieve configuration
      // todo connect this to the GuildConfig from the collection
      const channelConfig = await PollChannel.findOne(
         { channelId },
         'maxUserProposal voteAllowance forAgainst',
      ).exec();

      const countedPolls = await Poll.countDocuments({
         config: channelConfig._id,
         creatorId: userId,
         status: 'open',
      });

      await authorizeInteraction(interaction, 2);
      if (countedPolls >= channelConfig.maxUserProposal) {
         throw new Error('You do not have permission to use this command.');
      }

      // disabled until we nail down the cross-guild permissions on this command
      // if (
      //    !memberPermissions.has('MANAGE_GUILD') &&
      //    countedPolls >= channelConfig.maxUserProposal
      // ) {
      //    return interaction.reply({
      //       content:
      //          'You have exceeded the amount of allowed polls in this channel. You must wait until your current poll is closed.',
      //       ephemeral: true,
      //    });
      // }

      const modal = createPollModal(channelConfig);

      await showModal(modal, {
         client: client,
         interaction: interaction,
      });

      Logger.info(
         'commands/nerman/poll/createPoll.js: Finished creating poll.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};

function createPollModal(channelConfig) {
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
         'Descriptive text, links, and any supporting details needed for users to decide on your poll.',
      )
      .setStyle('LONG')
      .setMaxLength(2000)
      .setRequired(false);

   const pollChoices = new TextInputComponent()
      .setCustomId('pollChoices')
      .setLabel('Choices')
      .setPlaceholder(
         'Comma separated values. Minimum two options. eg) Yes, No, Abstain',
      )
      .setDefaultValue('Yes, No')
      .setStyle('SHORT')
      .setMaxLength(100)
      .setRequired(true);

   createPollComponents.push(pollTitle, pollDescription);

   if (!channelConfig.forAgainst) {
      createPollComponents.push(pollChoices);
   }

   if (channelConfig.voteAllowance) {
      const pollAllowance = new TextInputComponent()
         .setCustomId('voteAllowance')
         .setLabel('Votes Per User')
         .setPlaceholder('# of votes is a single user allowed.')
         .setDefaultValue('1')
         .setRequired(true)
         .setMaxLength(2)
         .setStyle('SHORT');

      createPollComponents.push(pollAllowance);
   }

   modal.addComponents(createPollComponents);

   Logger.info(
      'commands/slashCommands/poll/createPoll.js: Finished creating poll modal.',
   );

   return modal;
}
