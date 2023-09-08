const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_FEEDBACKER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_PROPOSAL_REASON = '';
const DEFAULT_VOTE_CHOICE = 1; // For.

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-feedback-sent')
      .setDescription('Trigger a feedback event.')
      .addStringOption(option => {
         return option
            .setName('feedbacker-address')
            .setDescription("The feedbacker's wallet address.")
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('proposal-number')
            .setDescription("The proposal's number.")
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
            .setDescription('The reason for the feedback.')
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
      const proposalNumber =
         interaction.options.getNumber('proposal-number') ??
         DEFAULT_PROPOSAL_NUMBER;
      const proposalReason =
         interaction.options.getString('reason') ?? DEFAULT_PROPOSAL_REASON;
      const voteChoice =
         interaction.options.getNumber('vote-choice') ?? DEFAULT_VOTE_CHOICE;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('FeedbackSent', {
         msgSender: { id: feedbackerAddress },
         proposalId: proposalNumber,
         support: voteChoice,
         reason: proposalReason,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a FeedbackSent event.',
      });

      Logger.info(
         'commands/trigger/feedbackSent.js: A FeedbackSent event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
