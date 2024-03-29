const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-federation')
      .setDescription('Trigger a Federation event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('federation-bid-placed')
            .setDescription('Trigger a new Federation Bid Placed event.')
            .addNumberOption(option => {
               return option
                  .setName('proposal-number')
                  .setDescription('The proposal being bid on.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('vote-choice')
                  .setDescription('The side being bid for.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development')
                  .addChoices(
                     { name: 'Against', value: 0 },
                     { name: 'For', value: 1 },
                     { name: 'Abstain', value: 2 },
                  );
            })
            .addNumberOption(option => {
               return option
                  .setName('ethereum-amount')
                  .setDescription('The amount of Eth being bid.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('bidder-address')
                  .setDescription("The bidder's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('vote-reason')
                  .setDescription('The vote reason.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('federation-vote-cast')
            .setDescription('Trigger a new Federation Vote Cast event.')
            .addNumberOption(option => {
               return option
                  .setName('proposal-number')
                  .setDescription('The proposal being bid on.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('vote-choice')
                  .setDescription('The side being bid for.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development')
                  .addChoices(
                     { name: 'Against', value: 0 },
                     { name: 'For', value: 1 },
                     { name: 'Abstain', value: 2 },
                  );
            })
            .addNumberOption(option => {
               return option
                  .setName('ethereum-amount')
                  .setDescription('The amount of Eth being bid.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('bidder-address')
                  .setDescription("The bidder's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-federation.js: Executed Nerman trigger command.',
      );
   },

   isHidden: process.env.DEPLOY_STAGE === 'production',
};
