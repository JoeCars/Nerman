const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_PROPOSAL_TITLE = '';
const DEFAULT_PROPOSER_WALLET = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_DESCRIPTION = '';

module.exports = {
   subCommand: 'trigger-nouns-fork.fork-proposal-created',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const proposalNumber =
         interaction.options.getNumber('proposal-number') ??
         DEFAULT_PROPOSAL_NUMBER;
      const proposalTitle =
         interaction.options.getString('proposal-title') ??
         DEFAULT_PROPOSAL_TITLE;
      const proposerWallet =
         interaction.options.getString('proposer-wallet') ??
         DEFAULT_PROPOSER_WALLET;
      const proposalDescription =
         interaction.options.getString('proposal-description') ??
         DEFAULT_PROPOSAL_DESCRIPTION;

      let description = proposalTitle.trim();
      if (description) {
         description = `# ${proposalTitle} \n`;
      }
      description += proposalDescription;

      const nouns = interaction.client.libraries.get('NounsFork');
      nouns.trigger('ProposalCreatedWithRequirements', {
         id: proposalNumber,
         description: description,
         proposer: { id: proposerWallet },
         event: { transactionHash: '0x0000000000000000000' },
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ForkProposalCreated event.',
      });

      Logger.info(
         'commands/trigger-nouns-fork.fork-proposal-created.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
