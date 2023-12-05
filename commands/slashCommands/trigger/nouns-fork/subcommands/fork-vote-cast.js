const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_VOTER_ID = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_VOTES = 42;
const DEFAULT_AGAINST_CHOICE = 0; // Against.
const DEFAULT_REASON = '';

module.exports = {
   subCommand: 'trigger-nouns-fork.fork-vote-cast',

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
      nouns.trigger('VoteCast', {
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
         'commands/trigger-nouns-fork.fork-vote-cast.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};