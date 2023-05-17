const {
   Modal,
   TextInputComponent,
   SelectMenuComponent,
   showModal,
} = require('discord-modals');
const { ButtonInteraction } = require('discord.js');
const Poll = require('../db/schemas/Poll');
const PollChannel = require('../db/schemas/PollChannel');
const Logger = require('../helpers/logger');

module.exports = {
   id: 'vote',
   /**
    *
    * @param {ButtonInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('buttons/vote.js: Attempting to press the vote button.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
         messageId: interaction.message.id,
      });

      if (!interaction.isButton()) {
         // console.log('VOTE BUTTON -- isButton: false', { interaction });
         return;
      }
      // console.log(
      //    'VOTE BUTTON -- isButton: true -- interaction',
      //    interaction.isButton()
      // );

      const {
         channelId,
         message: { id: messageId },
         user: { id: userId },
         member: {
            joinedTimestamp,
            roles: { cache: roleCache },
         },
      } = interaction;

      const { allowedRoles, anonymous: anon } = await PollChannel.findOne(
         { channelId },
         'allowedRoles'
      ).exec();

      if (!anon) {
         Logger.debug('buttons/vote.js: Checking joined time stamp.', {
            joinedTimestamp: joinedTimestamp,
         });
      }

      // console.log({ allowedRoles });

      if (!roleCache.hasAny(...allowedRoles)) {
         Logger.info(
            'buttons/vote.js: User does not have eligible roles to vote on this poll',
            {
               userId: interaction.user.id,
               guildId: interaction.guildId,
               channelId: interaction.channelId,
               messageId: interaction.message.id,
            }
         );
         return interaction.reply({
            content: 'You do not have a role eligible to vote on this poll.',
            ephemeral: true,
         });
      }

      const attachedPoll = await Poll.findOne({ messageId })
         .populate([{ path: 'config' }])
         .exec();

      // enabled disabled for testing
      if (attachedPoll.allowedUsers.get(userId) === true) {
         return interaction.reply({
            content: 'You have already used up your vote allowance.',
            ephemeral: true,
         });
      }

      if (!attachedPoll.allowedUsers.has(userId)) {
         return interaction.reply({
            content: `You are not eligible to participate in polls posted before your arrival:\nPoll posted on: <t:${Math.round(
               Date.parse(attachedPoll.timeCreated) / 1000
            )}:F>\nDate you joined: <t:${Math.round(joinedTimestamp / 1000)}>`,
            ephemeral: true,
         });
      }

      // return await interaction.reply({
      //    content: 'Ending early for testing',
      //    ephemeral: true,
      // });

      const capitalizedOptions = attachedPoll.pollData.choices.map(
         choice => choice[0].toUpperCase() + choice.substring(1)
      );

      // const optionsString = attachedPoll.pollData.choices.join(', ');
      const optionsString = capitalizedOptions.join(', ');
      // disabled until DJS SELECT MENU Modal supported
      // const optionsMap = attachedPoll.pollData.choices.map(choice => ({
      //    label: choice,
      //    value: choice,
      // }));

      // console.log({ attachedPoll });

      const modal = new Modal().setCustomId('vote-modal').setTitle('Vote');

      const selectOptions = new TextInputComponent()
         .setCustomId('votingSelect')
         .setLabel(`Type ${attachedPoll.pollData.voteAllowance} Choice(s)`)
         .setPlaceholder(optionsString)
         .setDefaultValue(optionsString)
         .setStyle('SHORT')
         .setMaxLength(100)
         .setRequired(true);

      // disabled until DJS supports SELECT MENU Modal
      // const selectOptions = new SelectMenuComponent()
      //    .setCustomId('votingSelect')
      //    .setPlaceholder('Make your selection(s)')
      //    .addOptions(optionsMap)
      //    .setMinValues(attachedPoll.config.voteAllowance)
      //    .setMaxValues(attachedPoll.config.voteAllowance);

      const reason = new TextInputComponent()
         .setCustomId('voteReason')
         .setLabel('Reason')
         .setPlaceholder('Explain your vote.')
         .setStyle('LONG');

      modal.addComponents(selectOptions, reason);

      try {
         await showModal(modal, {
            client: interaction.client,
            interaction: interaction,
         });
      } catch (error) {
         Logger.error('buttons/vote.js: Received an error.', {
            error: error,
         });
      }

      Logger.info('buttons/vote.js: Finished pressing the vote button.', {
         userId: interaction.user.id,
         guildId: interaction.guildId,
         channelId: interaction.channelId,
         messageId: interaction.message.id,
      });
   },
};
