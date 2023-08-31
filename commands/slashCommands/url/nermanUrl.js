const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');

// !test this is going to be testing passing Nerman.js in as an argument, so I'm attempting to make this a async thang?
module.exports = {
   // module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman-url')
      .setDescription('Commands to add, remove, and display the guild URLs.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Register a new set of URLs for this guild.')
            .addStringOption(option => {
               return option
                  .setName('proposal-url')
                  .setDescription('The URL for all future proposals.')
                  .setRequired(false);
            })
            .addStringOption(option => {
               return option
                  .setName('noun-url')
                  .setDescription('The URL for all future Nouns.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('remove')
            .setDescription('Removing the URLs registered to this guild.');
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('display')
            .setDescription('Displaying the URLs registered to this guild.');
      }),

   async execute() {
      Logger.info('commands/nermanUrl.js: Executed Nerman URL command.');
   },
};
