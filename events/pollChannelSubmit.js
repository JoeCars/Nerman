const { Modal } = require('discord-modals');
const { Types } = require('mongoose');
const PollChannel = require('../db/schemas/PollChannel');
const { logToObject } = require('../utils/functions');

module.exports = {
   name: 'modalSubmit',
   /**
    * @param {Modal} modal
    */
   async execute(modal) {
      if (modal.customId !== 'modal-create-poll-channel') return;

      await modal.deferReply({ ephemeral: true });

      const { channelId } = modal;

      const configCheck = await PollChannel.countDocuments( channelId );
      if (!!configCheck)
         return modal.editReply({
            content:
               'A configuration has already been created for this channel.',
            ephemeral: true,
         });

      const durRegex = new RegExp(/^\d{1,3}(\.\d{1,2})?$/, 'g');

      console.log({ durRegex });

      // extract data from submitted modal
      // const pollChannel = modal.getSelectMenuValues('pollChannel');
      // const pollChannel = channelId;
      const votingRoles = modal.getSelectMenuValues('votingRoles');
      let pollDuration = modal.getTextInputValue('pollDuration');
      const maxProposals = parseInt(modal.getTextInputValue('maxProposals'));
      const pollChannelOptions =
         modal.getSelectMenuValues('pollChannelOptions');

      // do a regex to match expected forma
      if (!durRegex.test(pollDuration)) {
         return modal.editReply({
            content:
               'The format of the duration submitted is not correct, please ensure you only include a numeric value representing hours.',
            ephermeral: true,
         });
      }

      pollDuration = parseFloat(pollDuration);

      try {
         const newPollChannel = await PollChannel.create({
            _id: new Types.ObjectId(),
            // channelId: pollChannel[0],
            channelId,
            allowedRoles: votingRoles,
            duration: pollDuration,
            maxUserProposal: maxProposals,
            voteAllowance: pollChannelOptions.includes('vote-allowance'),
            anonymous: pollChannelOptions.includes('anonymous-voting'),
            liveVisualFeed: pollChannelOptions.includes('live-results'),
            quorum: undefined,
         });
      } catch (error) {
         console.error(error);
      }

      modal.editReply({
         content: 'Polling channel has been successfully registered.',
         ephemeral: true,
      });
   },
};
