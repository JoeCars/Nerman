const { CommandInteraction } = require('discord.js');

const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_TITLE = 'Cheese For The Cheese God';
const DEFAULT_PROPOSAL_REASON = '';

module.exports = {
   subCommand: 'trigger-nouns-dao-data.proposal-candidate-updated',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const proposerAddress =
         interaction.options.getString('proposer-address') ??
         DEFAULT_PROPOSER_ADDRESS;
      const proposalTitle =
         interaction.options.getString('proposal-title') ??
         DEFAULT_PROPOSAL_TITLE;
      const proposalReason =
         interaction.options.getString('reason') ?? DEFAULT_PROPOSAL_REASON;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('ProposalCandidateUpdated', {
         msgSender: { id: proposerAddress },
         slug: proposalTitle
            .split(' ')
            .map(word => {
               return word.toLowerCase().trim();
            })
            .join('-'),
         reason: proposalReason,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ProposalCandidateUpdated event.',
      });

      Logger.info(
         'commands/trigger-nouns-dao-data.proposal-candidate-updated.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
