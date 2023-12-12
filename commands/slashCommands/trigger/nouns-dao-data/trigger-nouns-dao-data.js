const { SlashCommandBuilder } = require('@discordjs/builders');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-nouns-dao-data')
      .setDescription('Trigger a Federation event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('candidate-feedback-sent')
            .setDescription('Trigger a candidate feedback event.')
            .addStringOption(option => {
               return option
                  .setName('feedbacker-address')
                  .setDescription("The feedbacker's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('proposer-address')
                  .setDescription("The proposer's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('proposal-title')
                  .setDescription("The proposal's title.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('vote-choice')
                  .setDescription('The side being voted for.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development')
                  .addChoices(...[
                     ['Against', 0],
                     ['For', 1],
                     ['Abstain', 2],
                  ]);
            })
            .addStringOption(option => {
               return option
                  .setName('reason')
                  .setDescription('The reason for feedback.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('feedback-sent')
            .setDescription('Trigger a feedback event.')
            .addStringOption(option => {
               return option
                  .setName('feedbacker-address')
                  .setDescription("The feedbacker's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('proposal-number')
                  .setDescription("The proposal's number.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })

            .addNumberOption(option => {
               return option
                  .setName('vote-choice')
                  .setDescription('The side being voted for.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development')
                  .addChoices(...[
                     ['Against', 0],
                     ['For', 1],
                     ['Abstain', 2],
                  ]);
            })
            .addStringOption(option => {
               return option
                  .setName('reason')
                  .setDescription('The reason for the feedback.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('proposal-candidate-canceled')
            .setDescription('Trigger a proposal candidate canceled event.')
            .addStringOption(option => {
               return option
                  .setName('proposer-address')
                  .setDescription("The proposer's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('proposal-title')
                  .setDescription("The proposal's title.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('reason')
                  .setDescription('The reason for cancelling.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('proposal-candidate-created')
            .setDescription('Trigger a proposal candidate created event.')
            .addStringOption(option => {
               return option
                  .setName('proposer-address')
                  .setDescription("The proposer's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('title')
                  .setDescription("The proposal's title.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('description')
                  .setDescription('The proposal description.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('proposal-candidate-updated')
            .setDescription('Trigger a proposal candidate updated event.')
            .addStringOption(option => {
               return option
                  .setName('proposer-address')
                  .setDescription("The proposer's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('proposal-title')
                  .setDescription("The proposal's title.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('reason')
                  .setDescription('The reason for updating.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('signature-added')
            .setDescription('Trigger a signature added event.')
            .addStringOption(option => {
               return option
                  .setName('proposer-address')
                  .setDescription("The proposer's wallet address.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('signer-address')
                  .setDescription("The signer's address.")
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
                  .setName('reason')
                  .setDescription('The signature reason.')
                  .setRequired(false);
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-nouns-dao-data.js: Executed Nerman trigger command.',
      );
   },
};
