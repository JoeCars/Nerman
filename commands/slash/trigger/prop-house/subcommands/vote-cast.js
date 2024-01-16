const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_VOTER = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_ROUND = '0xe3ce3916c95b6f2a23a0601426b2c47b960100d8';
const DEFAULT_PROPOSAL_ID = 1;
const DEFAULT_VOTING_POWER = 42;

module.exports = {
   subCommand: 'trigger-prop-house.vote-cast',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const voter = interaction.options.getString('voter') ?? DEFAULT_VOTER;
      const round = interaction.options.getString('round') ?? DEFAULT_ROUND;
      const proposalId =
         interaction.options.getNumber('proposal-id') ?? DEFAULT_PROPOSAL_ID;
      const votingPower =
         interaction.options.getNumber('voting-power') ?? DEFAULT_VOTING_POWER;

      const propHouse = interaction.client.libraries.get('PropHouse');
      propHouse.trigger('VoteCast', {
         voter: {
            id: voter,
         },
         round: {
            id: round,
            title: 'Round 11 (Redo2)',
         },
         house: {
            id: '0x84ae050b4861c59f25be37352a66a3f1e0328aaf',
            name: 'Nouns DAO JAPAN',
         },
         proposalTitle: 'Order 66',
         proposalId,
         votingPower: `${votingPower}`,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a VoteCast event.',
      });

      Logger.info(
         'commands/trigger-prop-house.vote-cast.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
