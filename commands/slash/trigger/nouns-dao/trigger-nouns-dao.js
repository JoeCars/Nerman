const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-nouns-dao')
      .setDescription('Trigger a Nouns DAO event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('prop-created')
            .setDescription('Trigger a prop created event.')
            .addNumberOption(option => {
               return option
                  .setName('proposal-number')
                  .setDescription('The proposal number.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('proposal-title')
                  .setDescription('The proposal title.')
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
                  .setName('proposal-description')
                  .setDescription("The proposal's description.")
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('prop-status-change')
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
                  .addChoices(
                     { name: 'Canceled', value: 'Canceled' },
                     { name: 'Queued', value: 'Queued' },
                     { name: 'Vetoed', value: 'Vetoed' },
                     { name: 'Executed', value: 'Executed' },
                  );
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('prop-vote-cast')
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
                  .addChoices(
                     { name: 'Against', value: 0 },
                     { name: 'For', value: 1 },
                     { name: 'Abstain', value: 2 },
                  );
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
            .setName('escrowed-to-fork')
            .setDescription('Trigger an escrow to fork event.')
            .addNumberOption(option => {
               return option
                  .setName('fork-id')
                  .setDescription('The fork id.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
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
            })
            .addStringOption(option => {
               return option
                  .setName('reason')
                  .setDescription('The reason for the fork.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('execute-fork')
            .setDescription('Trigger an execute fork event.')
            .addNumberOption(option => {
               return option
                  .setName('fork-id')
                  .setDescription('The fork id.')
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
            .setName('join-fork')
            .setDescription('Trigger a joinFork event.')
            .addNumberOption(option => {
               return option
                  .setName('fork-id')
                  .setDescription('The fork id.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('owner-address')
                  .setDescription('The owner address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('token-number')
                  .setDescription('The number of tokens joining.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('reason')
                  .setDescription('The reason.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('withdraw-from-escrow')
            .setDescription('Trigger a withdrawNounsFromEscrow event.')
            .addStringOption(option => {
               return option
                  .setName('withdrawer-address')
                  .setDescription('The withdrawer address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('token-number')
                  .setDescription('The number of tokens being escrowed.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-nouns-dao.js: Executed Nerman trigger command.',
      );
   },

   isHidden: process.env.DEPLOY_STAGE === 'production',
};
