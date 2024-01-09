const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-farcaster')
      .setDescription('Trigger a Farcaster event.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('nouns-cast')
            .setDescription('Trigger a NounsCast event.')
            .addStringOption(option => {
               return option
                  .setName('text')
                  .setDescription("The cast's body.")
                  .setRequired(process.env.DEPLOY_STAGE !== 'development');
            });
      }),

   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute() {
      Logger.info(
         'commands/trigger-farcaster.js: Executed Nerman trigger command.',
      );
   },

   isHidden: process.env.DEPLOY_STAGE === 'production',
};
