const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_PROPOSAL_TITLE = '';
const DEFAULT_PROPOSER_WALLET = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_DESCRIPTION = '';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-fork-proposal-created')
      .setDescription('Trigger a prop created event.')
      .addNumberOption(option => {
         return option
            .setName('proposal-number')
            .setDescription('The proposal number.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('proposer-wallet')
            .setDescription("The proposer's wallet address.")
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addStringOption(option => {
         return option
            .setName('proposal-title')
            .setDescription('The proposal title.')
            .setRequired(false);
      })
      .addStringOption(option => {
         return option
            .setName('proposal-description')
            .setDescription("The proposal's description.")
            .setRequired(false);
      }),

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
         'commands/trigger/forkProposalCreated.js: A ForkProposalCreated event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
