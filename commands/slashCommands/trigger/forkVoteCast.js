const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_VOTER_ID = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_VOTES = 42;
const DEFAULT_AGAINST_CHOICE = 0; // Against.
const DEFAULT_REASON = '';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-fork-vote-cast')
      .setDescription('Trigger a prop created event.')
      .addNumberOption(option => {
         return option
            .setName('proposal-number')
            .setDescription('The proposal number.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('voter-wallet')
            .setDescription('The voter wallet id.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('vote-number')
            .setDescription('The number of votes.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('vote-choice')
            .setDescription('The vote choice.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development')
            .addChoices([
               ['Against', 0],
               ['For', 1],
               ['Abstain', 2],
            ]);
      })
      .addStringOption(option => {
         return option
            .setName('vote-reason')
            .setDescription('The vote reason.')
            .setRequired(false);
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const proposalId =
         interaction.options.getNumber('proposal-number') ??
         DEFAULT_PROPOSAL_NUMBER;
      const voterId =
         interaction.options.getString('voter-wallet') ?? DEFAULT_VOTER_ID;
      const votes =
         interaction.options.getNumber('vote-number') ?? DEFAULT_VOTES;
      const voteChoice =
         interaction.options.getNumber('vote-choice') ?? DEFAULT_AGAINST_CHOICE;
      const voteReason =
         interaction.options.getString('vote-reason') ?? DEFAULT_REASON;

      const nouns = interaction.client.libraries.get('NounsFork');
      nouns.emit('VoteCast', {
         proposalId: proposalId,
         voter: { id: voterId },
         votes: votes,
         supportDetailed: voteChoice,
         reason: voteReason,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ForkVoteCast event.',
      });

      Logger.info(
         'commands/trigger/forkVoteCast.js: A ForkVoteCast event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
