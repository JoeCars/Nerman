const { CommandInteraction, MessageEmbed } = require('discord.js');
const { Modal, TextInputComponent, showModal } = require('discord-modals');
const Poll = require('../../../db/schemas/Poll');
const PollChannel = require('../../../db/schemas/PollChannel');
const Logger = require('../../../helpers/logger');
const Vote = require('../../../db/schemas/Vote');
const mongoose = require('mongoose');

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
      const embed = createPollEmbed(newPoll);

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

function createPollEmbed(newPoll) {
   const embedFields = [
      { name: '\u200B', value: '\u200B', inline: false },
      { name: 'Quorum', value: '...', inline: true },
      { name: 'Voters', value: '0', inline: true },
      { name: 'Abstains', value: '0', inline: true },
      { name: 'Voting Closes', value: '...', inline: false },
   ];

   const embed = new MessageEmbed()
      .setColor('#ffffff')
      .setTitle(newPoll.pollData.title)
      .setDescription(newPoll.pollData.description)
      .addFields(embedFields)
      .setFooter('Submitted by ...');
   return embed;
}

async function generateRandomVotes(newPoll, interaction) {
   const numOfVotes = interaction.options.getInteger('number-of-votes');
   for (let i = 0; i < numOfVotes; ++i) {
      const newVote = new Vote({
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

      await newVote.save();
   }
}

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
   });
   await newPoll.save();
   return newPoll;
}
