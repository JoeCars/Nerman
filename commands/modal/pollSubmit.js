const {
   EmbedBuilder,
   codeBlock,
   ModalSubmitInteraction,
} = require('discord.js');
const { Types } = require('mongoose');

const { generateInitialPollMessage } = require('../../views/embeds/polls');
const ResultBar = require('../../structures/ResultBar');
const User = require('../../db/schemas/User');
const Poll = require('../../db/schemas/Poll');
const PollChannel = require('../../db/schemas/PollChannel');
const PollCount = require('../../db/schemas/ChannelPollCount');
const Logger = require('../../helpers/logger');

const { longestString } = require('../../helpers/poll');

module.exports = {
   id: 'modal-create-poll',
   /**
    * @param {ModalSubmitInteraction} modal
    */
   async execute(modal) {
      Logger.info('events/poll/pollSubmit.js: Attempting to submit a poll.', {
         channelId: modal.channelId,
         guildId: modal.guildId,
         user: modal.user.username,
      });

      if (modal.customId !== 'modal-create-poll') return;

      await modal.deferReply();

      const {
         client,
         channelId,
         guildId,
         guild: {
            members: { cache: memberCache },
            roles: {
               everyone: { id: everyoneId },
            },
         },
         member: {
            nickname,
            user,
            user: { username, discriminator },
         },
      } = modal;

      const channelConfig = await PollChannel.findOne(
         {
            channelId,
         },
         'allowedRoles forAgainst voteThreshold liveVisualFeed',
      );

      const intRegex = new RegExp(/^\d*$/);

      Logger.debug('events/poll/pollSubmit.js: Checking permissions.', {
         channelId: modal.channelId,
         guildId: modal.guildId,
         user: modal.user.username,
         everyoneId: everyoneId,
         allowedRoles: channelConfig.allowedRoles,
      });

      // extract data from submitted modal
      const title = modal.fields.getTextInputValue('pollTitle');
      const description =
         modal.fields.getTextInputValue('pollDescription') ?? '';

      let options;

      // todo forGainst in newProposal
      if (channelConfig.forAgainst) {
         options = ['for', 'against'];
      } else {
         options = [
            ...new Set(
               modal.fields
                  .getTextInputValue('pollChoices')
                  .split(',')
                  .map(x => x.trim().toLowerCase())
                  .filter(v => v !== ''),
            ),
         ];
      }

      let voteAllowance = 1;
      if (channelConfig.voteAllowance) {
         voteAllowance = modal.fields.getTextInputValue('voteAllowance');
      }

      Logger.debug('events/poll/pollSubmit.js: Checking vote options.', {
         channelId: modal.channelId,
         guildId: modal.guildId,
         user: modal.user.username,
         options: options,
         voteAllowance: voteAllowance,
      });

      if (isNaN(voteAllowance)) {
         voteAllowance = `${modal.fields.getTextInputValue('voteAllowance')}`;
      }

      if (!intRegex.test(voteAllowance)) {
         modal.deleteReply();

         return modal.followUp({
            content: `***${voteAllowance}*** - is not a valid vote allowance number.\nPlease choose a whole number.`,
            ephemeral: true,
         });
      }

      if (options.length < 2) {
         modal.deleteReply();

         return modal.followUp({
            content:
               'You require a minimum of two options to vote. Use comma separated values to input choices. Eg) Yes, No, Abstain',
            ephemeral: true,
         });
      }

      if (voteAllowance > options.length) {
         modal.deleteReply();

         return modal.followUp({
            content:
               'Currently we are unable to facilitate having more votes than options.',
            ephemeral: true,
         });
      }

      const channel = client.channels.cache.get(channelId);

      const messageObject = await generateInitialPollMessage({
         title,
         description,
         channelConfig,
         everyoneId,
      });

      Logger.debug('events/poll/pollSubmit.js: Checking vote options.', {
         channelId: modal.channelId,
         guildId: modal.guildId,
         user: modal.user.username,
         messageObject: messageObject,
      });

      let message;
      try {
         message = await channel.send(messageObject);
      } catch (error) {
         Logger.error('events/poll/pollSubmit.js: Received error.', {
            error: error,
         });

         await modal.deleteReply({
            content: '',
            ephemeral: true,
         });

         await modal.followUp({
            content:
               'Nerman does not have access to posting in this channel, despite channel configurations. Have you checked to see if Nerman has been added to this channel?',
            ephemeral: true,
         });
      }

      const { id } = message;

      const pollData = {
         title,
         description,
         voteAllowance,
         choices: options,
      };

      const snapshotMap = new Map();
      const eligibleKeys = [];

      // todo try to implement env for the allowed roles so that we can do this dynamically when hosting and using in other servers
      // todo also this should be done via fetching the config
      try {
         const allowedUsers = await message.guild.members
            .fetch({
               withPresences: true,
            })
            .then(fetchedMembers => {
               return fetchedMembers.filter(member => {
                  return (
                     !member.user.bot &&
                     member?.roles.cache.hasAny(...channelConfig.allowedRoles)
                  );
               });
            });

         for (const key of allowedUsers.keys()) {
            snapshotMap.set(key, false);
            eligibleKeys.push(key);
         }

         Logger.debug('events/poll/pollSubmit.js: Checking eligible keys.', {
            channelId: modal.channelId,
            guildId: modal.guildId,
            user: modal.user.username,
            eligibleKeys: eligibleKeys,
         });
      } catch (error) {
         Logger.error('events/poll/pollSubmit.js: Received error.', {
            error: error,
         });
      }

      const { _id, durationMs, quorum } = await PollChannel.findOne({
         channelId,
      }).exec();

      const countExists = await PollCount.checkExists(channelId);

      let pollNumber;

      if (!countExists) {
         pollNumber = await PollCount.createCount(channelId);
      } else {
         pollNumber = await PollCount.findOne({ channelId }).exec();
      }

      try {
         // todo refactor this to use {new: true} and return the document perhaps, rather than this two part operation?
         Logger.debug('events/poll/pollSubmit.js: Checking poll attributes.', {
            guildId: guildId,
            userId: user.id,
            pollData: pollData,
         });

         const data = {
            _id: new Types.ObjectId(),
            guildId,
            creatorId: user.id,
            messageId: id,
            config: _id,
            pollData,
            votes: undefined,
            abstains: undefined,
            allowedUsers: snapshotMap,
            status: 'open',
            pollNumber: undefined,
         };

         const newPoll = await (await Poll.createNewPoll(data, durationMs))
            .populate('config')
            .then(async poll => {
               await pollNumber.increment();
               poll.pollNumber = pollNumber.pollsCreated;
               return await poll.save();
            });

         // todo Make this updating eligible users channel map into a reusable function

         const updateVoterPromise = [...newPoll.allowedUsers.keys()].map(
            async key => {
               // todo I need to add in a proper check for if these people exist
               let user = await User.findOne().byDiscordId(key, guildId).exec();

               if (user && user.eligibleChannels.has(channelId)) {
                  user.eligibleChannels.get(channelId).eligiblePolls++;
               } else if (user && !user.eligibleChannels.has(channelId)) {
                  // todo maybe use the method to construct the paerticipation object by aggregating all docs accounting for Polls with the allowed user, just to be a bit more thorough
                  user.eligibleChannels.set(newPoll.config.channelId, {
                     eligiblePolls: 1,
                     participatedPolls: 0,
                  });
               } else {
                  const member = memberCache.get(key);
                  const memberRoles = member.roles.cache;
                  const eligibleChannels = await User.findEligibleChannels(
                     memberRoles,
                  );
                  user = await User.createUser(guildId, key, eligibleChannels);

                  return user;
               }

               user.markModified('eligibleChannels');
               return user.save();
            },
         );

         await Promise.all(updateVoterPromise);

         const updatedEmbed = new EmbedBuilder(messageObject.embeds[0].data);

         updatedEmbed.setFooter({
            text: `Poll #${newPoll.pollNumber} submitted by ${
               nickname ?? username
            }#${discriminator}`,
         });

         let embedQuorum = Math.ceil(
            newPoll.allowedUsers.size * (quorum / 100),
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : embedQuorum > 0 ? 1 : 0;

         updatedEmbed.data.fields.find(({ name }) => name === 'Quorum').value =
            embedQuorum.toString();

         updatedEmbed.data.fields.find(
            ({ name }) => name === 'Voting Closes',
         ).value = `<t:${Math.floor(newPoll.timeEnd.getTime() / 1000)}:f>`;

         // todo Extract code into module
         if (channelConfig.liveVisualFeed) {
            const results = newPoll.results;
            const longestOption = longestString(
               newPoll.pollData.choices,
            ).length;

            const resultsArray = newPoll.config.voteThreshold
               ? [
                    `Threshold: ${newPoll.voteThreshold} ${
                       newPoll.voteThreshold > 1 ? 'votes' : 'vote'
                    }\n`,
                 ]
               : [];

            let resultsOutput = [];

            const barWidth = 8;
            const totalVotes = results.totalVotes;

            const votesMap = new Map([
               ['maxLength', barWidth],
               ['totalVotes', totalVotes],
            ]);

            for (const key in results.distribution) {
               const label = key[0].toUpperCase() + key.substring(1);
               const votes = results.distribution[key];
               const room = longestOption - label.length;
               const optionObj = new ResultBar(label, votes, room, votesMap);

               votesMap.set(label, optionObj);
               resultsArray.push(optionObj.completeBar);
            }

            resultsArray.push(`\nAbstains: ${newPoll.abstains.size}`);

            resultsOutput = codeBlock(resultsArray.join('\n'));

            updatedEmbed.spliceFields(1, 0, {
               name: 'Results',
               value: resultsOutput,
               inline: false,
            });
         }

         const threadName =
            title.length <= 100 ? title : `${title.substring(0, 96)}...`;

         client.emit('enqueuePoll', newPoll);
         await message.edit({ embeds: [updatedEmbed] });
         await message.startThread({
            name: threadName,
            autoArchiveDuration: 10080, // todo probably make this based on channelConfig?
         });

         await message.thread.send(`Discussion:`);
         message.react('✅');
      } catch (error) {
         Logger.error('events/poll/pollSubmit.js: Encountered an error.', {
            error: error,
         });
      }

      // todo add button vomponents in AFTER initial DB commit of the poll

      Logger.info('events/poll/pollSubmit.js: Successfully submitted poll.', {
         channelId: modal.channelId,
         guildId: modal.guildId,
         user: modal.user.username,
      });

      await modal.followUp({
         content: 'Poll Submitted!',
      });

      return modal.deleteReply({
         content: 'Poll Submitted!',
      });
   },
};
