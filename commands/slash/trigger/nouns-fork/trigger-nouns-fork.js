const { SlashCommandBuilder } = require('discord.js');

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
                  .addChoices(
                     { name: 'Canceled', value: 'Canceled' },
                     { name: 'Queued', value: 'Queued' },
                     { name: 'Executed', value: 'Executed' },
                  );
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
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('fork-delegate-changed')
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
            .setName('fork-noun-created')
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
            .setName('transfer-fork-noun')
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
         'commands/trigger-nouns-fork.js: Executed Nerman trigger command.',
      );
   },
};
