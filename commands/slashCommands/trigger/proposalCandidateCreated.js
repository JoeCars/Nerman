const { CommandInteraction } = require('discord.js');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_PROPOSAL_TITLE = 'Dear Humanity';
const DEFAULT_PROPOSER_ADDRESS = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_DESCRIPTION = '';

module.exports = {
   subCommand: 'nerman-trigger.proposal-candidate-created',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const proposalTitle =
         interaction.options.getString('title') ?? DEFAULT_PROPOSAL_TITLE;
      const proposerWallet =
         interaction.options.getString('proposer-address') ??
         DEFAULT_PROPOSER_ADDRESS;
      const proposalDescription =
         interaction.options.getString('description') ??
         DEFAULT_PROPOSAL_DESCRIPTION;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('ProposalCandidateCreated', {
         slug: proposalTitle
            .split(' ')
            .map(word => {
               return word.toLowerCase().trim();
            })
            .join('-'),
         msgSender: { id: proposerWallet },
         description: proposalDescription,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ProposalCandidateCreated event.',
      });

      Logger.info(
         'commands/trigger/proposalCandidateCreated.js: A proposal candidate created event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
