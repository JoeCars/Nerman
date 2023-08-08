const { CommandInteraction } = require('discord.js');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const ETH_TO_WEI_RATE = 100_0000_0000_0000_0000;
const DEFAULT_NOUN_ID = 117;
const DEFAULT_ETH_AMOUNT = 42;
const DEFAULT_WALLET = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';

module.exports = {
   subCommand: 'nerman-trigger.auction-bid',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const nounId =
         interaction.options.getNumber('noun-number') ?? DEFAULT_NOUN_ID;
      const ethereumAmount =
         interaction.options.getNumber('ethereum-amount') ?? DEFAULT_ETH_AMOUNT;
      const bidderAddress =
         interaction.options.getString('bidder-address') ?? DEFAULT_WALLET;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('AuctionBid', {
         id: nounId,
         amount: ethereumAmount * ETH_TO_WEI_RATE,
         bidder: {
            id: bidderAddress,
         },
      });

      interaction.reply({
         ephemeral: true,
         content: 'Trigger an AuctionBid event.',
      });

      Logger.info(
         'commands/trigger/auctionBid.js: An auction bid has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
