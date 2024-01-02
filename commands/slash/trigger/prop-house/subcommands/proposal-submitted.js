const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_PROPOSER = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_ROUND = '0xe3ce3916c95b6f2a23a0601426b2c47b960100d8';
const DEFAULT_PROPOSAL_ID = 1;
const DEFAULT_TITLE = 'My New Proposal!';

module.exports = {
   subCommand: 'trigger-prop-house.proposal-submitted',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const proposer =
         interaction.options.getString('proposer') ?? DEFAULT_PROPOSER;
      const round = interaction.options.getString('round') ?? DEFAULT_ROUND;
      const title = interaction.options.getString('title') ?? DEFAULT_TITLE;
      const proposalId =
         interaction.options.getNumber('proposal-id') ?? DEFAULT_PROPOSAL_ID;

      const propHouse = interaction.client.libraries.get('PropHouse');
      propHouse.trigger('ProposalSubmitted', {
         proposer: {
            id: proposer,
         },
         round: {
            id: round,
         },
         proposalId,
         title,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ProposalSubmitted event.',
      });

      Logger.info(
         'commands/trigger-prop-house.proposal-submitted.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
