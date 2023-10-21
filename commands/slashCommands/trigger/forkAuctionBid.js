const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const ETH_TO_WEI_RATE = 100_0000_0000_0000_0000;
const DEFAULT_NOUN_ID = 117;
const DEFAULT_ETH_AMOUNT = 42;
const DEFAULT_WALLET = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-fork-auction-bid')
      .setDescription('Trigger an auction bid event.')
      .addStringOption(option => {
         return option
            .setName('bidder-address')
            .setDescription("The bidder's wallet address.")
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('ethereum-amount')
            .setDescription('The amount of Eth being bid.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      })
      .addNumberOption(option => {
         return option
            .setName('noun-number')
            .setDescription('The noun being bid on.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      }),

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

      const nouns = interaction.client.libraries.get('NounsForkAuctionHouse');
      nouns.trigger('AuctionBid', {
         id: nounId,
         amount: ethereumAmount * ETH_TO_WEI_RATE,
         bidder: {
            id: bidderAddress,
         },
      });

      interaction.reply({
         ephemeral: true,
         content: 'Trigger a ForkAuctionBid event.',
      });

      Logger.info(
         'commands/trigger/forkAuctionBid.js: A ForkAuctionBid has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
