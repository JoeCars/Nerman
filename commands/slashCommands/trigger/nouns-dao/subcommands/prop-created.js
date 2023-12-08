const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSAL_NUMBER = 117;
const DEFAULT_PROPOSAL_TITLE = 'Six Seasons And A Movie!';
const DEFAULT_PROPOSER_WALLET = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_PROPOSAL_DESCRIPTION = '';

module.exports = {
   subCommand: 'trigger-nouns-dao.prop-created',

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

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('ProposalCreatedWithRequirements', {
         id: proposalNumber,
         description: `# ${proposalTitle} \n ${proposalDescription}`,
         proposer: { id: proposerWallet },
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a PropCreated event.',
      });

      Logger.info(
         'commands/trigger-nouns-dao.prop-created.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
