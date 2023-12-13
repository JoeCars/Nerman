const { ModalSubmitInteraction } = require('discord.js');
const { Types } = require('mongoose');

const PollChannel = require('../db/schemas/PollChannel');
const FeedConfig = require('../db/schemas/FeedConfig');
const Logger = require('../helpers/logger');
const events = require('../utils/feedEvents');

module.exports = {
   id: 'modal-create-poll-channel',
   /**
    * @param {ModalSubmitInteraction} modal
    */
   async execute(modal) {
      Logger.info(
         'events/poll/pollChannelSubmit.js: Attempting to create a poll channel.',
         {
            guildId: modal.guild.id,
            channelId: modal.channelId,
         },
      );

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

         const configCheck = await PollChannel.countDocuments({
            channelId,
         }).exec();

         if (!!configCheck) {
            return modal.editReply({
               content:
                  'A configuration has already been created for this channel.',
               ephemeral: true,
            });
         }

         const guildConfig = await (guildConfigs.has(guildId) &&
            guildConfigs.get(guildId));

         Logger.debug(
            'events/poll/pollChannelSubmit.js: Checking guild config.',
            {
               guildId: modal.guild.id,
               channelId: modal.channelId,
               guildConfig: guildConfig,
            },
         );

         const durRegex = new RegExp(/^\d{1,3}(\.\d{1,2})?$/, 'g');
         // const quorRegex = new RegExp(/^\d{1,2}(\.\d{1,2})?$/, 'g');

         // /^(^\d{1,2}(\.\d{1,2})?$)|(^100(\.00)?$)$/;
         const quorRegex = new RegExp(
            /^(^\d{1,2}(\.\d{1,2})?$)|(^100(\.00)?$)$/,
         );
         const optionRegex = new RegExp(
            /^(^vote-allowance$)?(^live-results$)?(^anonymous-voting$)?(^for-or-against$)?(^nouns-dao$)?(^lil-nouns$)?$/,
         );

         // extract data from submitted modal
         // const pollChannel = modal.getSelectMenuValues('pollChannel');
         // const pollChannel = channelId;
         // disabled until modals are supported
         // const votingRoles = modal.getSelectMenuValues('votingRoles');
         // !testing voting roles from text input
         const votingRoles = modal.fields
            .getTextInputValue('votingRoles')
            .split(',')
            .map(x => x.trim())
            .filter(v => v !== '');
         let pollDuration = modal.fields.getTextInputValue('pollDuration');
         const maxProposals = parseInt(
            modal.fields.getTextInputValue('maxProposals'),
         );
         // let pollQuorum = modal.fields.getTextInputValue('pollQuorumThreshold');
         let pollQuorumThreshold = modal.fields.getTextInputValue(
            'pollQuorumThreshold',
         );

         // check the characters at the beginning and end of the input string
         const [firstChar, lastChar] = [
            pollQuorumThreshold.at(0),
            pollQuorumThreshold.at(-1),
         ];

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
                  ', ',
               )}***`,
               ephermeral: true,
            });
         }

         const pollChannelOptions = modal.fields.getTextInputValue(
            'pollChannelOptions',
         )
            ? modal.fields
                 .getTextInputValue('pollChannelOptions')
                 .split(',')
                 .map(x => x.trim())
                 .filter(v => v !== '')
            : [];

         let pollQuorum = pollQuorumThreshold[0];
         let voteThreshold = pollQuorumThreshold[1] ?? 0;

         Logger.debug(
            'events/poll/pollChannelSubmit.js: Checking poll options.',
            {
               guildId: modal.guild.id,
               channelId: modal.channelId,
               pollQuorum: pollQuorum,
               voteThreshold: voteThreshold,
               pollChannelOptions: pollChannelOptions,
               pollQuorumThreshold: pollQuorumThreshold,
               votingRoles: votingRoles,
            },
         );

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
                        !managed && votingRoles.includes(name),
                  )
                  .map(({ id }) => id),
            );

         // Check to see if any values from user submission don't match roles in guild/channel
         if (allowedRoles.length !== votingRoles.length) {
            const badRoles = votingRoles.filter(
               role => !allowedRoles.some(value => value === role),
            );

            return modal.editReply({
               content: `Incorrect role(s) found:\n${badRoles}\nPlease check your spelling. `,
               ephermeral: true,
            });
         }

         //disabled until DJS supports Modal SelectMenus
         // const pollChannelOptions =
         // modal.getSelectMenuValues('pollChannelOptions');

         Logger.debug('events/poll/pollChannelSubmit.js: Checking 0 Quorum', {
            guildId: modal.guild.id,
            channelId: modal.channelId,
            quorum: Math.ceil(50 * (pollQuorum / 100)),
         });

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
                  'One or more of the Poll Channel Options you have entered does not match.\nYour options are: vote-allowance, live-results, anonymous-voting, for-or-against, nouns-dao, lil-nouns',
               ephermeral: true,
            });
         }

         pollDuration = parseFloat(pollDuration);
         pollQuorum = parseFloat(pollQuorum) > 0 ? parseFloat(pollQuorum) : 0;

         Logger.info(
            'events/poll/pollChannelSubmit.js: Creating a new channel config document.',
            {
               guildId: modal.guild.id,
               channelId: modal.channelId,
            },
         );

         const newPollChannel = await PollChannel.create({
            _id: new Types.ObjectId(),
            guildConfig: guildConfig._id,
            channelId,
            // disabled until modal support
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

         if (pollChannelOptions.includes('nouns-dao')) {
            await registerForPollEvents(guildId, channelId);
         }

         // Not included as a default option.
         if (pollChannelOptions.includes('lil-nouns')) {
            await registerLilNounsPollEvents(guildId, channelId);
         }

         Logger.info(
            `events/poll/pollChannelSubmit.js: Repopulating channel configuration list, because channels belong to this guild config.`,
            {
               guildId: modal.guild.id,
               channelId: modal.channelId,
               numOfPollChannels: guildConfig.pollChannels.length,
            },
         );

         await guildConfig.depopulate('pollChannels');
         await guildConfig.populate('pollChannels');

         Logger.info(
            `events/poll/pollChannelSubmit.js: Configuration list has been repopulated!`,
            {
               guildId: modal.guild.id,
               channelId: modal.channelId,
               numOfPollChannels: guildConfig.pollChannels.length,
            },
         );

         Logger.info(
            'events/poll/pollChannelSubmit.js: Finished creating poll channel.',
            {
               guildId: modal.guild.id,
               channelId: modal.channelId,
            },
         );

         return modal.editReply({
            content: 'Polling channel has been successfully registered.',
            ephemeral: true,
         });
      } catch (error) {
         Logger.error(
            'events/poll/pollChannelSubmit.js: Encountered an error.',
            { error: error },
         );
         return modal.editReply({
            content: 'Polling channel has been successfully registered.',
            ephemeral: true,
         });
      }
   },
};

async function registerForPollEvents(guildId, channelId) {
   const pollEvents = [...events.entries()]
      .filter(([key, value]) => {
         return value.split('.')[0] === 'NermanPoll';
      })
      .map(([key, value]) => {
         return key;
      });

   try {
      for (let i = 0; i < pollEvents.length; ++i) {
         await FeedConfig.create({
            _id: new Types.ObjectId(),
            guildId: guildId,
            channelId: channelId,
            eventName: pollEvents[i],
         });
      }
   } catch (error) {
      Logger.error(
         'events/discordEvents/interaction/modal/pollChannelSubmit.js: Unable to register poll events.',
         {
            error: error,
         },
      );
   }
}

async function registerLilNounsPollEvents(guildId, channelId) {
   const pollEvents = [...events.entries()]
      .filter(([key, value]) => {
         return value.split('.')[0] === 'LilNounsPoll';
      })
      .map(([key, value]) => {
         return key;
      });

   try {
      for (let i = 0; i < pollEvents.length; ++i) {
         await FeedConfig.create({
            _id: new Types.ObjectId(),
            guildId: guildId,
            channelId: channelId,
            eventName: pollEvents[i],
         });
      }
   } catch (error) {
      Logger.error(
         'events/discordEvents/interaction/modal/pollChannelSubmit.js: Unable to register poll events.',
         {
            error: error,
         },
      );
   }
}
