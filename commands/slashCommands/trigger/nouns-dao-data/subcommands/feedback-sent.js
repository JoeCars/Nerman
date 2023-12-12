const { CommandInteraction } = require('discord.js');

const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_FEEDBACKER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_PROPOSAL_REASON = '';
const DEFAULT_VOTE_CHOICE = 1; // For.

module.exports = {
   subCommand: 'trigger-nouns-dao-data.feedback-sent',

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
         'commands/trigger-nouns-dao-data.feedback-sent.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
