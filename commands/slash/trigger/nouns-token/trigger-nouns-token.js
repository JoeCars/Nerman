const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-nouns-token')
      .setDescription('Trigger a Nouns Token event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('delegate-changed')
            .setDescription('Trigger a delegate changed event.')
            .addStringOption(option => {
               return option
                  .setName('delegator-id')
                  .setDescription("The delegator's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('new-delegate-id')
                  .setDescription("The new delegate's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('nouns-transferred')
                  .setDescription('The number of nouns being transferred.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('noun-created')
            .setDescription('Trigger a noun created event.')
            .addNumberOption(option => {
               return option
                  .setName('noun-id')
                  .setDescription('The noun created.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('transfer-noun')
            .setDescription('Trigger a transfer noun event.')
            .addNumberOption(option => {
               return option
                  .setName('noun-number')
                  .setDescription('The noun number.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('from-wallet')
                  .setDescription('The wallet of the old owner.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('to-wallet')
                  .setDescription('The wallet of the new owner.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-nouns-token.js: Executed Nerman trigger command.',
      );
   },
};
