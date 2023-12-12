const { SlashCommandBuilder } = require('@discordjs/builders');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-nouns-fork')
      .setDescription('Trigger a Nouns Fork event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('fork-proposal-created')
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
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('fork-proposal-status-change')
            .setDescription('Trigger a prop status change event.')
            .addNumberOption(option => {
               return option
                  .setName('proposal-number')
                  .setDescription('The proposal number.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('proposal-status')
                  .setDescription('The proposal status.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development')
                  .addChoices(...[
                     ['Canceled', 'Canceled'],
                     ['Queued', 'Queued'],
                     ['Executed', 'Executed'],
                  ]);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('fork-quit')
            .setDescription('Trigger a fork quit event.')
            .addStringOption(option => {
               return option
                  .setName('owner-address')
                  .setDescription("The owner's address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('token-number')
                  .setDescription('The number of tokens being escrowed.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('fork-vote-cast')
            .setDescription('Trigger a prop created event.')
            .addNumberOption(option => {
               return option
                  .setName('proposal-number')
                  .setDescription('The proposal number.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('voter-wallet')
                  .setDescription('The voter wallet id.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('vote-number')
                  .setDescription('The number of votes.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('vote-choice')
                  .setDescription('The vote choice.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development')
                  .addChoices(...[
                     ['Against', 0],
                     ['For', 1],
                     ['Abstain', 2],
                  ]);
            })
            .addStringOption(option => {
               return option
                  .setName('vote-reason')
                  .setDescription('The vote reason.')
                  .setRequired(false);
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-nouns-fork.js: Executed Nerman trigger command.',
      );
   },
};
