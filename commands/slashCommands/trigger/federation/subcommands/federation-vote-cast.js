const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const ETH_TO_WEI_RATE = 100_0000_0000_0000_0000;
const DEFAULT_DAO = '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d';
const DEFAULT_PROPOSAL_NUMBER = 346;
const DEFAULT_VOTE_CHOICE = 1;
const DEFAULT_ETH_AMOUNT = 0.42;
const DEFAULT_BIDDER_ADDRESS = '0x2B0E9aA394209fa8D783C9e8cbFb08A15C019cdF';

module.exports = {
   subCommand: 'trigger-federation.federation-vote-cast',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const dao = DEFAULT_DAO;
      const proposalNumber =
         interaction.options.getNumber('proposal-number') ||
         DEFAULT_PROPOSAL_NUMBER;
      const voteChoice =
         interaction.options.getNumber('vote-choice') ?? DEFAULT_VOTE_CHOICE;
      const ethereumAmount =
         interaction.options.getNumber('ethereum-amount') || DEFAULT_ETH_AMOUNT;
      const bidderAddress =
         interaction.options.getString('bidder-address') ||
         DEFAULT_BIDDER_ADDRESS;

      const federationNounsPool = interaction.client.libraries.get(
         'FederationNounsPool',
      );
      federationNounsPool.trigger('VoteCast', {
         dao: dao,
         propId: proposalNumber,
         support: voteChoice,
         amount: ethereumAmount * ETH_TO_WEI_RATE,
         bidder: bidderAddress,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a Federation Vote Cast event.',
      });

      Logger.info(
         'commands/trigger-federation.federation-vote-cast.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
