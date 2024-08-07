const {
   ModalSubmitInteraction,
   EmbedBuilder,
   userMention,
   inlineCode,
   codeBlock,
   hyperlink,
} = require('discord.js');
const { Types } = require('mongoose');

const Poll = require('../../db/schemas/Poll');
const User = require('../../db/schemas/User');
const Vote = require('../../db/schemas/Vote');
const Logger = require('../../helpers/logger');

const { longestString } = require('../../helpers/poll');
const ResultBar = require('../../structures/ResultBar');

const nouncilId = process.env.TESTNERMAN_NOUNCIL_CHAN_ID;
const jtsNouncilId = process.env.JTS_NOUNCIL_ID;
const doppelId = process.env.DEVNERMAN_NOUNCIL_CHAN_ID;

const guildNouncilIds = [nouncilId, jtsNouncilId, doppelId];

/**
 * @param {string} username
 * @param {string} userId
 */
async function registerUsername(username, userId) {
   try {
      await User.updateOne(
         { discordId: userId },
         { username: username },
      ).exec();
   } catch (error) {
      Logger.error('commands/modal/pollVote.js: Unable to register username.', {
         username,
         userId,
         error,
      });
   }
}

module.exports = {
   name: 'vote-modal',
   /**
    * @param {ModalSubmitInteraction} modal
    */
   async execute(modal) {
      Logger.info('commands/modal/pollVote.js: Attempting to submit vote.', {
         guildId: modal.guildId,
         channelId: modal.channelId,
         userId: modal.member.user.id,
         modalCustomId: modal.customId,
      });

      if (modal.customId !== 'vote-modal') return;

      await modal.deferReply({ ephemeral: true });

      const {
         client,
         guildId,
         customId,
         channelId,
         member: {
            roles: { cache: memberRoleCache },
            user: { id: userId },
         },
         message: { id: messageId },
      } = modal;

      const propRegExp = new RegExp(/^prop\s(\d{1,5})/, 'i');

      const pollStatus = await Poll.findOne(
         { messageId },
         'status pollData.voteAllowance pollData.choices config creatorId',
      ).exec();

      const pollOptions = await pollStatus.pollOptions();

      let voteArray = modal.fields.getTextInputValue('votingSelect');

      if (voteArray !== null) {
         voteArray = voteArray
            .split(',')
            .map(x => x.trim().toLowerCase())
            .filter(v => v !== '');
      } else {
         return modal.editReply({
            content:
               'Make sure that you submit a vote, an empty string is not sufficient.',
            ephermeral: true,
         });
      }

      let incorrectOptions = voteArray.filter(
         vote => !pollStatus.pollData.choices.includes(vote),
      );

      Logger.debug(
         'commands/modal/pollVote.js: Checking incorrect voting options.',
         {
            guildId: modal.guildId,
            channelId: modal.channelId,
            userId: modal.member.user.id,
            modalCustomId: modal.customId,
            incorrectOptions: incorrectOptions,
         },
      );

      if (incorrectOptions.length) {
         return modal.editReply({
            content: `Invalid choice(s):\n\n${incorrectOptions.join(
               ' ',
            )}\n\nPlease check you spelling when selecting your options.`,
            ephermeral: true,
         });
      }

      if (voteArray.length !== pollStatus.pollData.voteAllowance) {
         return modal.editReply({
            content: `You are required to select ${pollStatus.pollData.voteAllowance} choice(s)`,
            ephermeral: true,
         });
      }

      const voteReason = modal.fields.getTextInputValue('voteReason');

      if (pollStatus.status === 'closed') {
         return modal.editReply({
            content: 'Unable to register your vote, this poll has closed.',
            ephermeral: true,
         });
      }

      //todo include an evaluation for choosing the same option twice
      if (pollStatus.pollData.voteAllowance !== voteArray.length) {
         return modal.editReply({
            content: `You need to choose ${pollStatus.pollData.voteAllowance} option(s)`,
            ephermeral: true,
         });
      }

      const userVote = await Vote.create({
         _id: new Types.ObjectId(),
         poll: pollStatus._id,
         user:
            !guildNouncilIds.includes(channelId) && pollOptions.anonymous
               ? undefined
               : userId,
         choices: voteArray,
         reason: voteReason || undefined,
      });

      let votingUser = await User.findOne().byDiscordId(userId, guildId).exec();

      if (!votingUser) {
         Logger.warn(
            'commands/modal/pollVote.js: User cannot vote here. Attempting to find eligible voting channels.',
            {
               guildId: modal.guildId,
               channelId: modal.channelId,
               messageOd: modal.message.id,
               userId: modal.member.user.id,
            },
         );

         const eligibleChannels = await User.findEligibleChannels(
            memberRoleCache,
            pollOptions.anonymous,
         );

         votingUser = await User.createUser(guildId, userId, eligibleChannels);
      }

      const updatedPoll = await Poll.findAndSetVoted(messageId, userId);

      votingUser.incParticipation(channelId);
      await registerUsername(modal.user.username, modal.user.id);

      // todo I need to extract this chunk into a module

      const results = updatedPoll.results;
      const longestOption = longestString(updatedPoll.pollData.choices).length;

      const resultsArray = pollStatus.config.voteThreshold
         ? [
              `Threshold: ${updatedPoll.voteThreshold} ${
                 updatedPoll.voteThreshold > 1 ? 'votes' : 'vote'
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

      resultsArray.push(`\nAbstains: ${updatedPoll.abstains.size}`);

      resultsOutput = codeBlock(resultsArray.join('\n'));

      const message = await client.channels.cache
         .get(channelId)
         .messages.fetch(messageId);

      const updateEmbed = new EmbedBuilder(message.embeds[0]);

      updateEmbed.spliceFields(
         updateEmbed.data.fields.findIndex(({ name }) => name === 'Voters'),
         1,
         {
            name: 'Voters',
            value: `${updatedPoll.countVoters}`,
            inline: true,
         },
      );

      // NOTE: This is just to fix open polls without Voting Closes fields
      // todo remove later when I find out the specific root of this issue
      if (!updateEmbed.data.fields.find(({ name }) => name === 'Quorum')) {
         updateEmbed.spliceFields(
            updateEmbed.data.fields.findIndex(({ name }) => name === 'Voters'),
            0,
            {
               name: 'Quorum',
               value: `${updatedPoll.voterQuorum}`,
               inline: true,
            },
         );
      }

      // NOTE: This is just to fix open polls without Voting Closes fields
      // todo remove later when I find out the specific root of this issue
      if (
         !updateEmbed.data.fields.find(({ name }) => name === 'Voting Closes')
      ) {
         updateEmbed.spliceFields(
            updateEmbed.data.fields.findIndex(
               ({ name }) => name === 'Abstains',
            ) + 1,
            0,
            {
               name: 'Voting Closes',
               value: `<t:${Math.floor(
                  updatedPoll.timeEnd.getTime() / 1000,
               )}:f>`,
               inline: false,
            },
         );
      }

      if (pollOptions.liveVisualFeed) {
         updateEmbed.spliceFields(
            updateEmbed.data.fields.findIndex(({ name }) => name === 'Results'),
            1,
            {
               name: 'Results',
               value: resultsOutput,
               inline: false,
            },
         );
      }

      message.edit({ embeds: [updateEmbed] });

      const nermanIds = process.env.NERMAN_BOT_IDS.split(',');
      const isProposalPoll = nermanIds.includes(pollStatus.creatorId);

      if (isProposalPoll && propRegExp.test(updatedPoll.pollData.title)) {
         try {
            const matches = updatedPoll.pollData.title.match(propRegExp);

            const propText = matches[0];
            const propId = matches[1];

            const threadEmbed = new EmbedBuilder()
               .setColor('#00FFFF')
               .setDescription(
                  `${
                     guildNouncilIds.includes(channelId)
                        ? 'Anon Nouncillor'
                        : !pollOptions.anonymous
                        ? userMention(userId)
                        : 'Anon'
                  } voted ${
                     pollOptions.forAgainst
                        ? inlineCode(voteArray.join(' ').toUpperCase())
                        : inlineCode(voteArray.join(' '))
                  } on ${hyperlink(
                     propText,
                     `https://nouns.wtf/vote/${propId}`,
                  )}.${!!voteReason ? `\n\n${voteReason.trim()}` : ``}`,
               );

            const thread = await message.thread.fetch();

            await thread.send({ embeds: [threadEmbed] });
         } catch (error) {
            Logger.error('commands/modal/pollVote.js: Received an error.', {
               error: error,
            });
         }
      } else {
         try {
            const threadEmbed = new EmbedBuilder()
               .setColor('#00FFFF')
               .setDescription(
                  `${
                     guildNouncilIds.includes(channelId)
                        ? 'Anon Nouncillor'
                        : !pollOptions.anonymous
                        ? userMention(userId)
                        : 'Anon'
                  } voted ${
                     pollOptions.forAgainst
                        ? inlineCode(voteArray.join(' ').toUpperCase())
                        : inlineCode(voteArray.join(' '))
                  }.${!!voteReason ? `\n\n${voteReason.trim()}` : ``}`,
               );

            const thread = await message.thread.fetch();

            await thread.send({ embeds: [threadEmbed] });
         } catch (error) {
            Logger.error('commands/modal/pollVote.js: Received an error.', {
               error: error,
            });
         }
      }

      Logger.info('commands/modal/pollVote.js: Successfully submitted vote.', {
         guildId: modal.guildId,
         channelId: modal.channelId,
         userId: modal.member.user.id,
         userVote: userVote,
      });

      return modal.editReply({
         content: 'Your vote has been submitted',
         ephemeral: true,
      });
   },
};
