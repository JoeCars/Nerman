const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord-modals');

const Logger = require('../../../helpers/logger');

// !test this is going to be testing passing Nerman.js in as an argument, so I'm attempting to make this a async thang?
module.exports = {
   // module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman-trigger')
      .setDescription('Nerman Global Command Prefix')
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-poll')
            .setDescription('Create a poll in the current channel.'),
      )
      .addSubcommand(subcommand => {
         return subcommand
            .setName('auction-bid')
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
            .setName('auction-created')
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
                  .addChoices([
                     ['Canceled', 'Canceled'],
                     ['Queued', 'Queued'],
                     ['Vetoed', 'Vetoed'],
                     ['Executed', 'Executed'],
                  ]);
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
                  .addChoices([
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
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('new-noun-nymz-post')
            .setDescription('Trigger a new Nouns Nymz post event.')
            .addBooleanOption(option => {
               return option
                  .setName('is-doxed')
                  .setDescription('Set whether the user is doxed or not.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('post-title')
                  .setDescription('The post title.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addBooleanOption(option => {
               return option
                  .setName('is-reply')
                  .setDescription(
                     'Set whether the post is a reply or an original post.',
                  )
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('post-id')
                  .setDescription('The post id.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('user-id')
                  .setDescription('The user id.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('body')
                  .setDescription('The body of the post.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      })
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
                  .addChoices([
                     ['Against', 0],
                     ['For', 1],
                     ['Abstain', 2],
                  ]);
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
                  .addChoices([
                     ['Against', 0],
                     ['For', 1],
                     ['Abstain', 2],
                  ]);
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
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('auction-end')
            .setDescription('Trigger an auction end event.')
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
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info('commands/trigger.js: Executed Nerman trigger command.');
   },
};
