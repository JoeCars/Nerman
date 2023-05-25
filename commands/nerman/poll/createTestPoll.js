const { CommandInteraction, MessageEmbed } = require('discord.js');
const { Modal, TextInputComponent, showModal } = require('discord-modals');
const Poll = require('../../../db/schemas/Poll');
const User = require('../../../db/schemas/User');
const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');
const Vote = require('../../../db/schemas/Vote');
const mongoose = require('mongoose');
const { longestString } = require('../../../helpers/poll');
const ResultBar = require('../../../classes/ResultBar');
const { codeBlock } = require('@discordjs/builders');

module.exports = {
   subCommand: 'nerman.create-test-poll',
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/nerman/poll/createPoll.js: Starting to create polls.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         }
      );

      const channelConfig = await PollChannel.findOne(
         { channelId: interaction.channelId },
         'maxUserProposal voteAllowance forAgainst'
      ).exec();

      if (!channelConfig) {
         return interaction.reply({
            content:
               'There are no configurations registered to this channel. You may only register from a channel in which polling has been configured.',
            ephemeral: true,
         });
      }

      const authorizedIds = process.env.BAD_BITCHES.split(',');
      if (!authorizedIds.includes(interaction.user.id)) {
         throw new Error('You do not have permission to use this command.');
      }

      interaction.deferReply();

      // Core logic.
      const newPoll = await createPoll(interaction, channelConfig);
      await generateRandomVotes(newPoll, interaction);
      const embed = await createPollEmbed(interaction, newPoll);

      interaction.editReply({
         content: 'Finished creating poll.',
         embeds: [embed],
      });

      Logger.info(
         'commands/nerman/poll/createPoll.j`s: Finished creating poll.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         }
      );
   },
};

async function createPollEmbed(interaction, newPoll) {
   // getVotes is a little funky. Needs to always be populated first.
   newPoll = await Poll.findById(newPoll._id)
      .populate([{ path: 'getVotes' }, { path: 'countVoters' }])
      .exec();

   const results = await newPoll.results;
   let winningResult = '';

   if ('winner' in results) {
      winningResult =
         results.winner !== null
            ? `${
                 results.winner[0].toUpperCase() + results.winner.substring(1)
              } - Wins`
            : 'Literally nobody voted on this :<';
   }

   if ('tied' in results) {
      winningResult = `${results.tied
         .flatMap(arr => arr[0][0].toUpperCase() + arr[0].substring(1))
         .join(', ')} - Tied`;
   }

   const longestOption = longestString(newPoll.pollData.choices).length;
   let resultsArray = newPoll.config.voteThreshold
      ? [
           `Threshold: ${newPoll.voteThreshold} ${
              newPoll.voteThreshold > 1 ? 'votes' : 'vote'
           }\n`,
        ]
      : [];
   let resultsOutput = [];

   const BAR_WIDTH = 8;
   let totalVotes = results.totalVotes;

   let votesMap = new Map([
      ['maxLength', BAR_WIDTH],
      ['totalVotes', totalVotes],
   ]);

   Logger.debug('Checking total votes', {
      totalVotes: totalVotes,
   });

   for (const key in results.distribution) {
      const label = key[0].toUpperCase() + key.substring(1);

      const votes = results.distribution[key];
      const room = longestOption - label.length;
      let optionObj = new ResultBar(label, votes, room, votesMap);

      votesMap.set(label, optionObj);
      resultsArray.push(optionObj.completeBar);
   }
   resultsOutput = codeBlock(resultsArray.join('\n'));

   const votersValue = `Quorum: ${newPoll.voterQuorum}\n\nParticipated: ${
      newPoll.countVoters + newPoll.countAbstains
   }\nEligible: ${newPoll.allowedUsers.size}`;

   const embedFields = [
      { name: '\u200B', value: '\u200B', inline: false },
      {
         name: 'RESULTS',
         value: codeBlock(winningResult),
         inline: false,
      },
      {
         name: 'VOTES',
         value: resultsOutput,
         inline: false,
      },
      {
         name: 'VOTERS',
         value: codeBlock(votersValue),
         inline: false,
      },
      {
         name: 'Voting Closes',
         value: `<t:${Math.floor(newPoll.timeEnd.getTime() / 1000)}:f>`,
         inline: false,
      },
   ];

   const {
      nickname,
      user: { username, discriminator },
   } = interaction.guild.members.cache.get(newPoll.creatorId);

   const embed = new MessageEmbed()
      .setColor('#ffffff')
      .setTitle(newPoll.pollData.title)
      .setDescription(newPoll.pollData.description)
      .addFields(embedFields)
      .setFooter(
         `Poll #${newPoll.pollNumber} submitted by ${
            nickname ?? username
         }#${discriminator}`
      );

   return embed;
}

async function generateRandomVotes(newPoll, interaction) {
   const numOfVotes = interaction.options.getInteger('number-of-votes');
   for (let i = 0; i < numOfVotes; ++i) {
      const newVote = await Vote.create({
         _id: new mongoose.Types.ObjectId(),
         poll: newPoll._id,
         user: interaction.user.id,
         choices:
            Math.random() >= 0.5
               ? [newPoll.pollData.choices[0]]
               : [newPoll.pollData.choices[1]],
         reason:
            Math.random() >= 0.5 ? 'Cool lightsabers.' : 'Sword go brrr...',
      });

      // Updating database stuff.
      let votingUser = await User.findOne()
         .byDiscordId(newPoll.creatorId, newPoll.guildId)
         .exec();
      await Poll.findAndSetVoted(newPoll.messageId, newPoll.creatorId);
      votingUser.incParticipation(interaction.channelId);
   }
}

let testNumber = 0;

async function createPoll(interaction, channelConfig) {
   let messageId = (await interaction.fetchReply()).id;
   const newPoll = new Poll({
      _id: new mongoose.Types.ObjectId(),
      guildId: interaction.guildId,
      creatorId: interaction.user.id,
      messageId: messageId,
      config: channelConfig._id,
      pollData: {
         title: `Test ${new Date().toISOString()}`,
         description: 'A test poll.',
         choices: channelConfig.forAgainst
            ? ['For', 'Against']
            : ['jedi', 'sith'],
      },
      timeEnd: new Date(),
      pollNumber: testNumber++,
   });
   await newPoll.save();
   return newPoll;
}
