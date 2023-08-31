const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_FEEDBACKER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_TITLE = 'Death Star Construction';
const DEFAULT_PROPOSAL_REASON =
   'A giant super weapon with a built-in flaw sounds like a bad idea. We should really get that fixed before we built it.';
const DEFAULT_VOTE_CHOICE = 0; // Against.

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-candidate-feedback-sent')
      .setDescription('Trigger a candidate feedback event.')
      .addStringOption(option => {
         return option
            .setName('feedbacker-address')
            .setDescription("The feedbacker's wallet address.")
            .setRequired(false);
      })
      .addStringOption(option => {
         return option
            .setName('proposer-address')
            .setDescription("The proposer's wallet address.")
            .setRequired(false);
      })
      .addStringOption(option => {
         return option
            .setName('proposal-title')
            .setDescription("The proposal's title.")
            .setRequired(false);
      })
      .addStringOption(option => {
         return option
            .setName('reason')
            .setDescription('The reason for feedback.')
            .setRequired(false);
      })
      .addNumberOption(option => {
         return option
            .setName('vote-choice')
            .setDescription('The side being voted for.')
            .setRequired(false)
            .addChoices([
               ['Against', 0],
               ['For', 1],
               ['Abstain', 2],
            ]);
      }),

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const feedbackerAddress =
         interaction.options.getString('feedbacker-address') ??
         DEFAULT_FEEDBACKER_ADDRESS;
      const proposerAddress =
         interaction.options.getString('proposer-address') ??
         DEFAULT_PROPOSER_ADDRESS;
      const proposalTitle =
         interaction.options.getString('proposal-title') ??
         DEFAULT_PROPOSAL_TITLE;
      const proposalReason =
         interaction.options.getString('reason') ?? DEFAULT_PROPOSAL_REASON;
      const voteChoice =
         interaction.options.getString('vote-choice') ?? DEFAULT_VOTE_CHOICE;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('CandidateFeedbackSent', {
         slug: proposalTitle
            .split(' ')
            .map(word => {
               return word.toLowerCase().trim();
            })
            .join('-'),
         msgSender: { id: feedbackerAddress },
         proposer: { id: proposerAddress },
         support: voteChoice,
         reason: proposalReason,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a CandidateFeedbackSent event.',
      });

      Logger.info(
         'commands/trigger/proposalCandidateCreated.js: A CandidateFeedbackSent event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
