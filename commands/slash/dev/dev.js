const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('dev')
      .setDescription('Nerman dev commands.')
      .addSubcommand(subcommand =>
         subcommand
            .setName('admin-check-voters')
            .setDescription(
               'Admin only and temporary, for gathering the names of the voting role members',
            )
            .addStringOption(option =>
               option
                  .setName('role-name')
                  .setDescription('Enter name of the role you wish to check')
                  .setRequired(false),
            ),
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-test-poll')
            .setDescription(
               'Create a poll with a number of votes and reasons for testing purposes.',
            )
            .addIntegerOption(option =>
               option
                  .setName('number-of-votes')
                  .setDescription(
                     'The number of votes randomly dispersed into the poll.',
                  )
                  .setRequired(true),
            ),
      ),

   async execute() {
      Logger.info('commands/slash/dev.js: Executed Nerman command.');
   },

   isHidden: process.env.DEPLOY_STAGE === 'production',
};
