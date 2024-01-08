const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-prop-house')
      .setDescription('Trigger a PropHouse event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('house-created')
            .setDescription('Trigger a HouseCreated event.')
            .addStringOption(option => {
               return option
                  .setName('creator')
                  .setDescription('The creator address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('house')
                  .setDescription('The house address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('round-created')
            .setDescription('Trigger a RoundCreated event.')
            .addStringOption(option => {
               return option
                  .setName('creator')
                  .setDescription('The creator address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('round')
                  .setDescription('The round address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('title')
                  .setDescription('The round title.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('house')
                  .setDescription('The house address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('vote-cast')
            .setDescription('Trigger a VoteCast event.')
            .addStringOption(option => {
               return option
                  .setName('voter')
                  .setDescription('The voter address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('round')
                  .setDescription('The round address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('proposal-id')
                  .setDescription('The proposal number.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('voting-power')
                  .setDescription('The number of votes.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('proposal-submitted')
            .setDescription('Trigger a ProposalSubmitted event.')
            .addStringOption(option => {
               return option
                  .setName('proposer')
                  .setDescription('The proposer address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('round')
                  .setDescription('The round address.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('title')
                  .setDescription('The proposal title.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addNumberOption(option => {
               return option
                  .setName('proposal-id')
                  .setDescription('The proposal number.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-prop-house.js: Executed Nerman trigger command.',
      );
   },

   isHidden: process.env.DEPLOY_STAGE === 'production',
};
