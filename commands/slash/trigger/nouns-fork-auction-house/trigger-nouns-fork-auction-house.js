const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-nouns-fork-auction-house')
      .setDescription('Trigger a Nouns Fork Auction House event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('fork-auction-bid')
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
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('fork-auction-created')
            .setDescription('Trigger an auction created event.')
            .addNumberOption(option => {
               return option
                  .setName('noun-number')
                  .setDescription('The noun being auctioned.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-nouns-fork-auction-house.js: Executed Nerman trigger command.',
      );
   },
};
