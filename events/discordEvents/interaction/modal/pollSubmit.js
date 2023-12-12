const { EmbedBuilder, MessageButton, MessageActionRow } = require('discord.js');
const { Modal } = require('discord-modals');
const { Types } = require('mongoose');
const { roleMention, codeBlock } = require('@discordjs/builders');
const { initPollMessage } = require('../../../../helpers/poll/initPollMessage');
const ResultBar = require('../../../../structures/ResultBar');
const User = require('../../../../db/schemas/User');
const Poll = require('../../../../db/schemas/Poll');
const PollChannel = require('../../../../db/schemas/PollChannel');
const PollCount = require('../../../../db/schemas/ChannelPollCount');
const Logger = require('../../../../helpers/logger');

const { drawBar, longestString } = require('../../../../helpers/poll');
const { logToObject, formatDate } = require('../../../../utils/functions');

// const { create}

module.exports = {
   name: 'modalSubmit',
   /**
    * @param {Modal} modal
    */
   async execute(modal) {
      Logger.info('events/poll/pollSubmit.js: Attempting to submit a poll.', {
         channelId: modal.channelId,
         guildId: modal.guildId,
         user: modal.user.username,
      });

      if (modal.customId !== 'modal-create-poll') return;

      // console.log('pollSubmit.js -- modal', { modal });

      await modal.deferReply();
      // await modal.deferReply({ ephemeral: true });

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

      // return modal.editReply({
      //    content: 'ABORT',
      //    ephemeral: true,
      // });

      // extract data from submitted modal
      const title = modal.getTextInputValue('pollTitle');
      const description = modal.getTextInputValue('pollDescription') ?? '';

      let options;

      // todo forGainst in newProposal
      if (channelConfig.forAgainst) {
         options = ['for', 'against'];
      } else {
         options = [
            // const options = [
            ...new Set(
               modal
                  .getTextInputValue('pollChoices')
                  .split(',')
                  .map(x => x.trim().toLowerCase())
                  .filter(v => v !== ''),
            ),
         ];
      }
      let voteAllowance = modal.getTextInputValue('voteAllowance') ?? 1;
      // let voteAllowance = parseInt(
      //    modal.getTextInputValue('voteAllowance') ?? 1
      // );

      Logger.debug('events/poll/pollSubmit.js: Checking vote options.', {
         channelId: modal.channelId,
         guildId: modal.guildId,
         user: modal.user.username,
         options: options,
         voteAllowance: voteAllowance,
      });

      if (isNaN(voteAllowance)) {
         voteAllowance = `${modal.getTextInputValue('voteAllowance')}`;
      }

      // return modal.editReply({ content: 'Return early', ephemeral: true });

      if (!intRegex.test(voteAllowance)) {
         modal.deleteReply();

         return modal.followUp({
            // return modal.followUp({
            content: `***${voteAllowance}*** - is not a valid vote allowance number.\nPlease choose a whole number.`,
            ephemeral: true,
         });
      }

      // ,, , Yes, No,Abstain,,, ,, , // <---- testing format string

      if (options.length < 2) {
         // return modal.editReply({
         modal.deleteReply();

         return modal.followUp({
            content:
               'You require a minimum of two options to vote. Use comma separated values to input choices. Eg) Yes, No, Abstain',
            ephemeral: true,
         });
      }

      if (voteAllowance > options.length) {
         // return modal.editReply({
         // return modal.deleteReply({
         modal.deleteReply();

         return modal.followUp({
            content:
               'Currently we are unable to facilitate having more votes than options.',
            ephemeral: true,
         });

         // return modal.deleteReply({
         //    content:
         //    'Currently we are unable to facilitate having more votes than options.',
         //    // ephemeral: true,
         // });
      }

      // console.log({ options });

      // console.log(type);
      // This will change when I implement it in the actual nNouns Discord
      // const pollingChannelID =
      //    type === 'nouncil'
      //       ? process.env.POLL_CHAN_ID_DEV
      //       : process.env.POLL_CHAN_ID_DEV;

      // const pollingChannelID =
      //    type === 'nouncil'
      //       ? process.env.POLL_CHAN_ID_DEV
      //       : process.env.POLL_CHAN_ID_DEV;

      // const channel = client.channels.cache.get(pollingChannelID);
      const channel = client.channels.cache.get(channelId);

      const messageObject = await initPollMessage({
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

      // let message = await channel.send({
      //    content: mentions,
      //    embeds: [embed],
      //    components: [voteActionRow],
      // });

      const { id } = message;
      // const { channelId, guildId, id } = message;

      // console.log({ message });

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
               // console.log(fetchedMembers);
               return fetchedMembers.filter(member => {
                  // console.log(member);
                  return (
                     !member.user.bot &&
                     member?.roles.cache.hasAny(...channelConfig.allowedRoles)
                  );
                  //disabled not worrying about the
                  // return (
                  //    member.presence?.status === 'online' &&
                  //    !member.user.bot &&
                  //    member?.roles.cache.hasAny(...channelConfig.allowedRoles)
                  // );
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

      // todo decide if I really need this or can just stick with the use-case below
      // const config = await PollChannel.findOne({ channelId }).exec();

      //
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
            // config: config._id,
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

         // await newPoll.populate('pollNumber');

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
               return await user.save();
               // return user;
            },
         );

         await Promise.all(updateVoterPromise);

         let updatedEmbed = new EmbedBuilder(messageObject.embeds[0]);

         updatedEmbed.setFooter({
            text: `Poll #${newPoll.pollNumber} submitted by ${
               nickname ?? username
            }#${discriminator}`,
         });

         let embedQuorum = Math.ceil(
            newPoll.allowedUsers.size * (quorum / 100),
         );

         embedQuorum = embedQuorum > 1 ? embedQuorum : embedQuorum > 0 ? 1 : 0;

         updatedEmbed.fields.find(({ name }) => name === 'Quorum').value =
            embedQuorum.toString();

         // if (updatedEmbed.fields.length === 6) {
         //    const votesAmount = Math.floor(
         //       newPoll.allowedUsers.size * (channelConfig.voteThreshold / 100)
         //    );
         //    updatedEmbed.fields[2].value = `${votesAmount >= 1 ? votesAmount : 1}`; // voteThreshold
         //    updatedEmbed.fields[5].value = `<t:${Math.floor(
         //       newPoll.timeEnd.getTime() / 1000
         //    )}:f>`; // timeEnd
         // } else {

         updatedEmbed.fields.find(
            ({ name }) => name === 'Voting Closes',
         ).value = `<t:${Math.floor(newPoll.timeEnd.getTime() / 1000)}:f>`; // timeEnd
         // }

         /**
          *
          *
          *
          *
          *
          *
          *
          */

         // todo Extract code into module
         if (channelConfig.liveVisualFeed) {
            const results = newPoll.results;
            const longestOption = longestString(
               newPoll.pollData.choices,
            ).length;

            let resultsArray = newPoll.config.voteThreshold
               ? [
                    `Threshold: ${newPoll.voteThreshold} ${
                       newPoll.voteThreshold > 1 ? 'votes' : 'vote'
                    }\n`,
                 ]
               : [];

            let resultsOutput = [];

            const barWidth = 8;
            let totalVotes = results.totalVotes;

            let votesMap = new Map([
               ['maxLength', barWidth],
               ['totalVotes', totalVotes],
            ]);

            for (const key in results.distribution) {
               const label = key[0].toUpperCase() + key.substring(1);
               const votes = results.distribution[key];
               const room = longestOption - label.length;
               let optionObj = new ResultBar(label, votes, room, votesMap);

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

         /**
          *
          *
          *
          *
          *
          *
          *
          *
          */

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
