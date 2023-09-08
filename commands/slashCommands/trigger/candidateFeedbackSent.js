const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_FEEDBACKER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_TITLE = 'Death Star Construction';
const DEFAULT_PROPOSAL_REASON = '';
const DEFAULT_VOTE_CHOICE = 0; // Against.

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-candidate-feedback-sent')
      .setDescription('Trigger a candidate feedback event.')
      .addStringOption(option => {
         return option
            .setName('feedbacker-address')
            .setDescription("The feedbacker's wallet address.")
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('proposer-address')
            .setDescription("The proposer's wallet address.")
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('proposal-title')
            .setDescription("The proposal's title.")
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('vote-choice')
            .setDescription('The side being voted for.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development')
            .addChoices([
               ['Against', 0],
               ['For', 1],
               ['Abstain', 2],
            ]);
      })
      .addStringOption(option => {
         return option
            .setName('reason')
            .setDescription('The reason for feedback.')
            .setRequired(false);
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
         interaction.options.getNumber('vote-choice') ?? DEFAULT_VOTE_CHOICE;

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
         'commands/trigger/candidateFeedbackSent.js: A CandidateFeedbackSent event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
