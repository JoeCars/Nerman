const { SlashCommandBuilder } = require('@discordjs/builders');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-propdates')
      .setDescription('Trigger a Propdates event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('post-update')
            .setDescription('Trigger a PostUpdate event.')
            .addNumberOption(option => {
               return option
                  .setName('proposal-number')
                  .setDescription('The proposal number.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addBooleanOption(option => {
               return option
                  .setName('is-completed')
                  .setDescription('The current status of the proposal.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            })
            .addStringOption(option => {
               return option
                  .setName('update')
                  .setDescription('The update description.')
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-propdates.js: Executed Nerman trigger command.',
      );
   },
};
