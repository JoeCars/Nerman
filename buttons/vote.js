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
const { checkUserEligibility } = require('../helpers/buttonEligibility');

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
         return;
      }

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
         'allowedRoles',
      ).exec();

      const attachedPoll = await Poll.findOne({ messageId })
         .populate([{ path: 'config' }])
         .exec();

      const eligibility = await checkUserEligibility(
         roleCache,
         allowedRoles,
         attachedPoll,
         userId,
         joinedTimestamp,
      );

      if (!eligibility.isEligible) {
         return interaction.reply({
            content: eligibility.message,
            ephemeral: true,
         });
      }

      const modal = createVoteModal(attachedPoll);

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

function createVoteModal(attachedPoll) {
   const capitalizedOptions = attachedPoll.pollData.choices.map(
      choice => choice[0].toUpperCase() + choice.substring(1),
   );

   const optionsString = capitalizedOptions.join(', ');
   const modal = new Modal().setCustomId('vote-modal').setTitle('Vote');

   const selectOptions = new TextInputComponent()
      .setCustomId('votingSelect')
      .setLabel(`Type ${attachedPoll.pollData.voteAllowance} Choice(s)`)
      .setPlaceholder(optionsString)
      .setDefaultValue(optionsString)
      .setStyle('SHORT')
      .setMaxLength(100)
      .setRequired(true);

   const reason = new TextInputComponent()
      .setCustomId('voteReason')
      .setLabel('Reason')
      .setPlaceholder('Explain your vote.')
      .setStyle('LONG');

   modal.addComponents(selectOptions, reason);
   return modal;
}
