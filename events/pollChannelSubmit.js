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

      const {
         channelId,
         member: {
            roles: { cache: roleCache },
         },
      } = modal;

      // console.log(modal.member);
      // console.log(modal.member.roles);
      // console.log(modal.member.roles.cache);
      console.log({ roleCache });

      const configCheck = await PollChannel.countDocuments({
         channelId,
      }).exec();
      console.log({ configCheck });
      if (!!configCheck)
         return modal.editReply({
            content:
               'A configuration has already been created for this channel.',
            ephemeral: true,
         });

      const durRegex = new RegExp(/^\d{1,3}(\.\d{1,2})?$/, 'g');
      const quorRegex = new RegExp(/^\d{1,2}(\.\d{1,2})?$/, 'g');
      const optionRegex = new RegExp(
         /^(^vote-allowance$)?(^live-results$)?(^anonymous-voting$)?$/
      );

      console.log({ durRegex });
      console.log({ quorRegex });

      // extract data from submitted modal
      // const pollChannel = modal.getSelectMenuValues('pollChannel');
      // const pollChannel = channelId;
      // disabled until modals are supported
      // const votingRoles = modal.getSelectMenuValues('votingRoles');
      // !testing voting roles from text input
      const votingRoles = modal
         .getTextInputValue('votingRoles')
         .split(',')
         .map(x => x.trim())
         .filter(v => v !== '');
      let pollDuration = modal.getTextInputValue('pollDuration');
      const maxProposals = parseInt(modal.getTextInputValue('maxProposals'));
      let pollQuorum = modal.getTextInputValue('pollQuorum');
      const pollChannelOptions = modal
         .getTextInputValue('pollChannelOptions')
         .split(',')
         .map(x => x.trim())
         .filter(v => v !== '');

      console.log({ votingRoles });
      console.log({ pollChannelOptions });

      // map the ids of the guild channels that match the names of the user submitted roles
      const allowedRoles = roleCache
         .filter(({ name }) => votingRoles.includes(name))
         .map(({ id }) => id);

      console.log({ allowedRoles });

      // Check to see if any values from user submission don't match roles in guild/channel
      if (allowedRoles.length !== votingRoles.length) {
         const badRoles = votingRoles.filter(
            role => !allowedRoles.some(value => value === role)
         );

         return modal.editReply({
            content: `Incorrect role(s) found:\n${badRoles}\nPlease check your spelling. `,
            ephermeral: true,
         });
      }


      //disabled until DJS supports Modal SelectMenus
      // const pollChannelOptions =
      // modal.getSelectMenuValues('pollChannelOptions');

      if (!durRegex.test(pollDuration)) {
         return modal.editReply({
            content:
               'The format of the duration submitted is not correct, please ensure you only include a numeric value representing hours.',
            ephermeral: true,
         });
      }

      if (!quorRegex.test(pollQuorum)) {
         return modal.editReply({
            content:
               'The format of the quorum % submitted is not correct, please ensure you only include a numeric value representing a %\n EG) 10.25% || 12% || 15.5%.',
            ephermeral: true,
         });
      }
      if (pollChannelOptions.some(option => !optionRegex.test(option))) {
         return modal.editReply({
            content:
               'One or more of the Poll Channel Options you have entered does not match.\nYour options are: vote-allowance, live-results, anonymous-voting',
            ephermeral: true,
         });
      }

      pollDuration = parseFloat(pollDuration);
      pollQuorum = parseFloat(pollQuorum);

      try {
         const newPollChannel = await PollChannel.create({
            _id: new Types.ObjectId(),
            // channelId: pollChannel[0],
            channelId,
            //disabled until modal support
            // allowedRoles: votingRoles,
            allowedRoles: allowedRoles,
            duration: pollDuration,
            maxUserProposal: maxProposals,
            voteAllowance: pollChannelOptions.includes('vote-allowance'),
            anonymous: pollChannelOptions.includes('anonymous-voting'),
            liveVisualFeed: pollChannelOptions.includes('live-results'),
            // quorum: undefined,
            quorum: pollQuorum,
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
