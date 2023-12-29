const {
   ModalBuilder,
   TextInputBuilder,
   ActionRowBuilder,
   TextInputStyle,
} = require('discord.js');

/**
 * @param {{label: string}[]} roleOptions
 */
exports.generatePollChannelModal = roleOptions => {
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
   const votingActionRow = new ActionRowBuilder().addComponents(votingRoles);

   const pollDuration = new TextInputBuilder()
      .setCustomId('pollDuration')
      .setLabel('Poll Duration (hours)')
      .setPlaceholder('Eg) 60')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(4)
      .setRequired(true);
   const durationActionRow = new ActionRowBuilder().addComponents(pollDuration);

   const maxProposals = new TextInputBuilder()
      .setCustomId('maxProposals')
      .setLabel('Max Active Polls Per User')
      .setPlaceholder(
         'Choose maximum number of active polls allowed per user with voting role.',
      )
      .setStyle(TextInputStyle.Short)
      .setMaxLength(3)
      .setRequired(true);
   const maxPollsActionRow = new ActionRowBuilder().addComponents(maxProposals);

   const pollQuorum = new TextInputBuilder()
      .setCustomId('pollQuorumThreshold')
      .setLabel('Choose Quorum %')
      .setPlaceholder('Eg) 30.5')
      .setValue('30.5')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(15)
      .setRequired(true);
   const quorumActionRow = new ActionRowBuilder().addComponents(pollQuorum);

   const pollChannelOptions = new TextInputBuilder()
      .setCustomId('pollChannelOptions')
      .setLabel('Choose Channel Options (if any)')
      .setPlaceholder(
         'anonymous-voting, live-results, vote-allowance, for-or-against, nouns-dao, lil-nouns',
      )
      .setValue('anonymous-voting, live-results, for-or-against, nouns-dao')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100);
   const optionsActionRow = new ActionRowBuilder().addComponents(
      pollChannelOptions,
   );

   modal.addComponents(
      votingActionRow,
      durationActionRow,
      maxPollsActionRow,
      quorumActionRow,
      optionsActionRow,
   );

   return modal;
};

/**
 * @param {{forAgainst: boolean, voteAllowance: boolean}} channelConfig
 */
exports.generatePollModal = channelConfig => {
   const modal = new ModalBuilder()
      .setCustomId('modal-create-poll')
      .setTitle('Create Poll');

   const actionRows = [];

   const pollTitle = new TextInputBuilder()
      .setCustomId('pollTitle')
      .setLabel('Title')
      .setPlaceholder('Poll title, or your main question.')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);
   actionRows.push(new ActionRowBuilder().addComponents(pollTitle));

   const pollDescription = new TextInputBuilder()
      .setCustomId('pollDescription')
      .setLabel('Description')
      .setPlaceholder(
         'Descriptive text, links, and any supporting details needed for users to decide on your poll.',
      )
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(2000)
      .setRequired(false);
   actionRows.push(new ActionRowBuilder().addComponents(pollDescription));

   if (!channelConfig.forAgainst) {
      const pollChoices = new TextInputBuilder()
         .setCustomId('pollChoices')
         .setLabel('Choices')
         .setPlaceholder(
            'Comma separated values. Minimum two options. eg) Yes, No, Abstain',
         )
         .setValue('Yes, No')
         .setStyle(TextInputStyle.Short)
         .setMaxLength(100)
         .setRequired(true);

      actionRows.push(new ActionRowBuilder().addComponents(pollChoices));
   }

   if (channelConfig.voteAllowance) {
      const pollAllowance = new TextInputBuilder()
         .setCustomId('voteAllowance')
         .setLabel('Votes Per User')
         .setPlaceholder('# of votes is a single user allowed.')
         .setValue('1')
         .setRequired(true)
         .setMaxLength(2)
         .setStyle(TextInputStyle.Short);

      actionRows.push(new ActionRowBuilder().addComponents(pollAllowance));
   }

   modal.addComponents(actionRows);

   return modal;
};

/**
 * @param {number} targetId
 */
exports.generateCancelConfirmationModal = targetId => {
   const confirmModal = new ModalBuilder()
      .setCustomId(`cancel-modal-${targetId}`)
      .setTitle('Cancel Poll?');

   const confirmCancel = new TextInputBuilder()
      .setCustomId('confirmCancel')
      .setLabel(`Type 'confirm' (no quotes) then submit.`)
      .setPlaceholder('confirm')
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);

   confirmModal.addComponents(
      new ActionRowBuilder().addComponents(confirmCancel),
   );
   return confirmModal;
};

/**
 * @param {{pollData: {choices: string[], voteAllowance: number}}} attachedPoll
 */
exports.generateVoteModal = attachedPoll => {
   const capitalizedOptions = attachedPoll.pollData.choices.map(
      choice => choice[0].toUpperCase() + choice.substring(1),
   );

   const optionsString = capitalizedOptions.join(', ');
   const modal = new ModalBuilder().setCustomId('vote-modal').setTitle('Vote');

   const selectOptions = new TextInputBuilder()
      .setCustomId('votingSelect')
      .setLabel(`Type ${attachedPoll.pollData.voteAllowance} Choice(s)`)
      .setPlaceholder(optionsString)
      .setValue(optionsString)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(true);
   const optionsActionRow = new ActionRowBuilder().addComponents(selectOptions);

   const reason = new TextInputBuilder()
      .setCustomId('voteReason')
      .setLabel('Reason')
      .setPlaceholder('Explain your vote.')
      .setStyle(TextInputStyle.Paragraph);
   const reasonActionRow = new ActionRowBuilder().addComponents(reason);

   modal.addComponents(optionsActionRow, reasonActionRow);
   return modal;
};
