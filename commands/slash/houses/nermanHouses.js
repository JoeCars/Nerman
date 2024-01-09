const { SlashCommandBuilder } = require('discord.js');
const Logger = require('../../../helpers/logger');

module.exports = {
   // module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman-houses')
      .setDescription('Commands to add, remove, and display houses.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription(
               'Register a new set of permitted houses for the channel.',
            )
            .addStringOption(option => {
               return option
                  .setName('house-addresses')
                  .setDescription('A comma separated list of permitted house addresses.')
                  .setRequired(true);
            })
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription('Channel to register in.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('remove')
            .setDescription(
               'Remove the permitted houses associated with the channel.',
            )
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription('Channel to remove in.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('display')
            .setDescription(
               'Display the permitted houses associated with the channel.',
            )
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription('Channel whose houses to display.')
                  .setRequired(false);
            });
      }),

   async execute() {
      Logger.info('commands/nermanHouses.js: Executed Nerman Houses command.');
   },
};
