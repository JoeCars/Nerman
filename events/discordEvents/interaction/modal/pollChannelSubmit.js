const { Modal } = require('discord-modals');
const { Types } = require('mongoose');
const PollChannel = require('../../../../db/schemas/PollChannel');
// const GuildConfig = require('../../db/schemas/GuildConfig');
const { logToObject } = require('../../../../utils/functions');

const { log: l } = console;

module.exports = {
   name: 'modalSubmit',
   /**
    * @param {Modal} modal
    */
   async execute(modal) {
      console.log('HI MOM');

      if (modal.customId !== 'modal-create-poll-channel') return;

      await modal.deferReply({ ephemeral: true });

      try {
         const {
            channelId,
            client: { guildConfigs },
            guild: { id: guildId, roles: gRoleCache },
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

         // const guildConfig = await GuildConfig.findOne({
         //    guildId: guildId,
         // }).exec();

         const guildConfig = await (guildConfigs.has(guildId) &&
            guildConfigs.get(guildId));

         l({ guildConfig });

         const durRegex = new RegExp(/^\d{1,3}(\.\d{1,2})?$/, 'g');
         // const quorRegex = new RegExp(/^\d{1,2}(\.\d{1,2})?$/, 'g');

         // /^(^\d{1,2}(\.\d{1,2})?$)|(^100(\.00)?$)$/;
         const quorRegex = new RegExp(
            /^(^\d{1,2}(\.\d{1,2})?$)|(^100(\.00)?$)$/
         );
         const optionRegex = new RegExp(
            /^(^vote-allowance$)?(^live-results$)?(^anonymous-voting$)?(^for-or-against$)?$/
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
         // let pollQuorum = modal.getTextInputValue('pollQuorumThreshold');
         let pollQuorumThreshold = modal.getTextInputValue(
            'pollQuorumThreshold'
         );

         // check the characters at the beginning and end of the input string
         const [firstChar, lastChar] = [
            pollQuorumThreshold.at(0),
            pollQuorumThreshold.at(-1),
         ];
         console.log({ firstChar, lastChar });

         if (firstChar === ':' || lastChar === ':') {
            return modal.editReply({
               content:
                  'Please make sure that you follow the correct formatting => <quorum>:<vote threshold>\n30.5:30',
               ephermeral: true,
            });
         }

         pollQuorumThreshold = pollQuorumThreshold
            .split(':')
            .map(x => x.trim())
            .filter(v => v !== '');

         if (pollQuorumThreshold.length > 2) {
            return modal.editReply({
               content: `Please double-check that you are not adding additional entries, and only using a single ***:*** to separate your values.\nYou entered ***${pollQuorumThreshold.join(
                  ', '
               )}***`,
               ephermeral: true,
            });
         }

         const pollChannelOptions = modal.getTextInputValue(
            'pollChannelOptions'
         )
            ? modal
                 .getTextInputValue('pollChannelOptions')
                 .split(',')
                 .map(x => x.trim())
                 .filter(v => v !== '')
            : [];

         console.log({ votingRoles });
         console.log({ pollChannelOptions });
         console.log({ pollQuorumThreshold });

         let pollQuorum = pollQuorumThreshold[0];
         let voteThreshold = pollQuorumThreshold[1] ?? 0;

         console.log({ pollQuorum });
         console.log({ voteThreshold });

         // map the ids of the guild channels that match the names of the user submitted roles
         // const allowedRoles = roleCache
         //    .filter(({ name }) => votingRoles.includes(name))
         //    .map(({ id }) => id);
         const allowedRoles = await gRoleCache
            .fetch()
            .then(fetchedRoles =>
               fetchedRoles
                  .filter(
                     ({ name, managed }) =>
                        !managed && votingRoles.includes(name)
                  )
                  .map(({ id }) => id)
            );

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

         console.log(
            'CHECKING 0 QUORUM => ',
            Math.floor(50 * (pollQuorum / 100))
         );

         if (!durRegex.test(pollDuration)) {
            return modal.editReply({
               content:
                  'The format of the duration submitted is not correct, please ensure you only include a numeric value representing hours.',
               ephermeral: true,
            });
         }

         if (!quorRegex.test(pollQuorum) || !quorRegex.test(voteThreshold)) {
            return modal.editReply({
               content:
                  'The format of the quorum or threshold % submitted is not correct, please ensure you only include a numeric value representing a %\n EG) 10.25% / 12% / 15.5%.',
               ephermeral: true,
            });
         }
         if (
            pollChannelOptions.length &&
            pollChannelOptions.some(option => !optionRegex.test(option))
         ) {
            return modal.editReply({
               content:
                  'One or more of the Poll Channel Options you have entered does not match.\nYour options are: vote-allowance, live-results, anonymous-voting, for-or-against',
               ephermeral: true,
            });
         }

         console.log({ pollQuorum });
         pollDuration = parseFloat(pollDuration);
         pollQuorum = parseFloat(pollQuorum) > 0 ? parseFloat(pollQuorum) : 0;

         console.log(parseFloat(pollQuorum));
         console.log(parseFloat(pollQuorum) > 0);
         console.log(parseFloat(pollQuorum) > 0 ? parseFloat(pollQuorum) : 0);

         // return modal.editReply({
         //    content: 'Aborting early for testing!',
         //    ephermeral: true,
         // });

         // try {
         l('Creating new channelConfig document...');

         const newPollChannel = await PollChannel.create({
            _id: new Types.ObjectId(),
            guildConfig: guildConfig._id,
            channelId,
            //disabled until modal support
            // allowedRoles: votingRoles,
            allowedRoles: allowedRoles,
            duration: pollDuration,
            maxUserProposal: maxProposals,
            voteAllowance: pollChannelOptions.includes('vote-allowance'),
            anonymous: pollChannelOptions.includes('anonymous-voting'),
            liveVisualFeed: pollChannelOptions.includes('live-results'),
            forAgainst: pollChannelOptions.includes('for-or-against'),
            quorum: pollQuorum,
            voteThreshold: voteThreshold,
         });

         l(
            `${guildConfig.pollChannels.length} Poll Channels belong to this guild configuration.\nRepopulating channel configuration list...`
         );
         await guildConfig.depopulate('pollChannels');
         await guildConfig.populate('pollChannels');

         l(
            `Configuration list has been repopulated!\n\n${guildConfig.pollChannels.length} poll Channels now belong to this guild.`
         );

         return modal.editReply({
            content: 'Polling channel has been successfully registered.',
            ephemeral: true,
         });
      } catch (error) {
         console.error(error);
         return modal.editReply({
            content: 'Polling channel has been successfully registered.',
            ephemeral: true,
         });
      }
   },
};
