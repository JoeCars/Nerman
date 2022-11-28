const { Modal } = require('discord-modals');
const {
   ButtonInteraction,
   ModalSubmitInteraction,
   MessageEmbed,
} = require('discord.js');
const { Types } = require('mongoose');
const Poll = require('../../db/schemas/Poll');
const User = require('../../db/schemas/User');
const Vote = require('../../db/schemas/Vote');

module.exports = {
   name: 'modalSubmit',
   /**
    * @param {ModalSubmitInteraction} interaction
    */
   async execute(modal) {
      if (modal.customId !== 'vote-modal') return;
      await modal.deferReply({ ephemeral: true });
      // async execute(interaction) {
      // console.log({ modal });

      // return;
      // if (!interaction.isCommand() && customId !== 'vote-modal') return;

      console.log('CUSTOM ID: \n', modal.customId);

      console.log('pollVote.js -- modal', { modal });
      // {
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

      const pollStatus = await Poll.findOne(
         { messageId },
         'status pollData.voteAllowance pollData.choices'
      );
      console.log({ pollStatus });

      let voteArray = modal.getTextInputValue('votingSelect');

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
         vote => !pollStatus.pollData.choices.includes(vote)
      );

      console.log({ incorrectOptions });

      if (incorrectOptions.length) {
         return modal.editReply({
            content: `Invalid choice(s):\n\n${incorrectOptions.join(
               ' '
            )}\n\nPlease check you spelling when selecting your options.`,
            ephermeral: true,
         });
      }

      console.log('voteArray.length', voteArray.length);
      console.log(
         'pollStatus.pollData.voteAllowance',
         pollStatus.pollData.voteAllowance
      );

      if (voteArray.length !== pollStatus.pollData.voteAllowance) {
         return modal.editReply({
            content: `You are required to select ${pollStatus.pollData.voteAllowance} choice(s)`,
            ephermeral: true,
         });
      }

      // disabled until DJS SELECT MENUS Modal supported
      // const voteArray = modal.getSelectMenuValues('votingSelect');
      const voteReason = modal.getTextInputValue('voteReason');

      console.log({ voteReason });

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
         // poll: targetPoll._id,
         poll: pollStatus._id,
         user: userId,
         choices: voteArray,
         reason: voteReason || undefined,
      });

      // await targetPoll.allowedUsers.set(userId, true);

      let votingUser = await User.findOne().byDiscordId(userId).exec();

      if (!votingUser) {
         const eligibleChannels = await User.findEligibleChannels(
            memberRoleCache
         );

         votingUser = await User.createUser(userId, eligibleChannels);
      }

      const updatedPoll = await Poll.findAndSetVoted(messageId, userId);

      console.log({ channelId });
      console.log('OUTSIDE IF', { votingUser });
      votingUser.incParticipation(channelId);

      let message = await client.channels.cache
         .get(channelId)
         .messages.fetch(messageId);

      const updateEmbed = new MessageEmbed(message.embeds[0]);

      updateEmbed.spliceFields(
         updateEmbed.fields.findIndex(({ name }) => name === 'Voters'),
         1,
         {
            name: 'Voters',
            value: `${updatedPoll.countVoters}`,
            inline: true,
         }
      );

      message.edit({ embeds: [updateEmbed] });

      // await targetPoll
      //    .save()
      //    .then(savedDoc => {
      //       console.log('targetPoll === savedDoc', targetPoll === savedDoc);
      //       console.log({ savedDoc });
      //       console.log('savedDoc.allowedUsers', savedDoc.allowedUsers);
      //    })
      //    .catch(err => console.error(err));
      // await targetPoll
      //    .save()
      //    .then(savedDoc => {
      //       console.log('targetPoll === savedDoc', targetPoll === savedDoc);
      //       console.log({ savedDoc });
      //       console.log('savedDoc.allowedUsers', savedDoc.allowedUsers);
      //    })
      //    .catch(err => console.error(err));

      // console.log('pollVote.js -- modal', { modal });
      console.log('pollVote.js -- userVote', { userVote });

      return modal.editReply({
         content: 'Your vote has been submitted',
         ephemeral: true,
      });
   },
};
