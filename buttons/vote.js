const {
   Modal,
   TextInputComponent,
   SelectMenuComponent,
   showModal,
} = require('discord-modals');
const { ButtonInteraction } = require('discord.js');
const Poll = require('../scratchcode/db/schema/Poll');

module.exports = {
   id: 'vote',
   /**
    *
    * @param {ButtonInteraction} interaction
    */
   async execute(interaction) {
      if (!interaction.isButton()) {
         console.log('VOTE BUTTON -- isButton: false', { interaction });
         return;
      }
      console.log(
         'VOTE BUTTON -- isButton: true -- interaction',
         interaction.isButton()
      );

      const {
         message: { id: messageId },
         user: { id: userId },
         member: {
            roles: { cache: roleCache },
         },
      } = interaction;

      // TODO Implement env variables for allowed roles
      if (!roleCache.has('919784986641575946')) {
         console.log('USER DOES NOT HAS ROLE');
         return interaction.reply({
            content: 'You do not have the role, dummy',
            ephemeral: true,
         });
      }

      // !testing population of votes via virtuals on vote modal instantiation, remove later and use this for live results and for closed poll data
      const attachedPoll = await Poll.findOne({ messageId })
         .populate([
            { path: 'config' },
            { path: 'countVoters' },
            { path: 'getVotes', select: 'choices -poll -_id' },
         ])
         .exec();
      // .populate('countVoters')
      // .populate('getVotes')

      // const countVoters = await attachedPoll.populate('countVoters').exec();

      // console.log({ countVoters });

      console.log({ attachedPoll });
      console.log(attachedPoll.countVoters);
      console.log(attachedPoll.getVotes);
      console.log(attachedPoll.results);

      if (!attachedPoll.allowedUsers.has(userId)) {
         return interaction.reply({
            content: 'You are not eligible to participate in this poll, square',
            ephemeral: true,
         });
      }

      // disabled disabled for testing
      // if (attachedPoll.allowedUsers.get(userId) === true) {
      //    return interaction.reply({
      //       content: 'You have already cast your vote, you political glutton',
      //       ephemeral: true,
      //    });
      // }

      const optionsMap = attachedPoll.pollData.choices.map(choice => ({
         label: choice,
         value: choice,
      }));

      // console.log({ attachedPoll });

      const modal = new Modal().setCustomId('vote-modal').setTitle('Vote');

      // const

      const selectOptions = new SelectMenuComponent()
         .setCustomId('votingSelect')
         .setPlaceholder('Make your selection(s)')
         .addOptions(optionsMap)
         .setMinValues(attachedPoll.config.voteAllowance)
         .setMaxValues(attachedPoll.config.voteAllowance);

      const reason = new TextInputComponent()
         .setCustomId('voteReason')
         .setLabel('Reason')
         .setPlaceholder('Real talk, which Spice Girl is the cutest?')
         .setStyle('LONG');

      modal.addComponents(selectOptions, reason);

      try {
         await showModal(modal, {
            client: interaction.client,
            interaction: interaction,
         });
      } catch (error) {
         console.error(error);
      }

      console.log({ modal });
   },
};
