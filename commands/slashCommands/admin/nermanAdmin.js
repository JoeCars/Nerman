const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');

module.exports = {
   // module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman-admin')
      .setDescription('Commands to add, remove, and display the guild admins.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Give a user admin privileges for Nerman.')
            .addUserOption(option => {
               return option
                  .setName('user')
                  .setDescription('The user being turned into an admin.')
                  .setRequired(true);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('remove')
            .setDescription("Removing a user' admin privileges for Nerman.")
            .addUserOption(option => {
               return option
                  .setName('user')
                  .setDescription('The user being removed from an admin.')
                  .setRequired(true);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('display')
            .setDescription('Displaying the admin users in this guild.');
      }),

   async execute() {
      Logger.info('commands/nermanAdmin.js: Executed Nerman Admin command.');
   },
};
