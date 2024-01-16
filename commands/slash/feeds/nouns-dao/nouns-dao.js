const { SlashCommandBuilder } = require('discord.js');

const { filterEvents } = require('../../../../helpers/feeds');
const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('nouns-dao')
      .setDescription('Commands to add and remove Nouns feeds.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Add Nouns events.')
            .addStringOption(option => {
               const nounsEvents = filterEvents('Nouns');
               nounsEvents.unshift({
                  name: 'All',
                  value: 'all',
               });
               return option
                  .setName('event')
                  .setDescription('The event to register.')
                  .setRequired(true)
                  .addChoices(...nounsEvents);
            })
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription('The feed channelّ.')
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('remove')
            .setDescription('Remove Nouns events.')
            .addStringOption(option => {
               const nounsEvents = filterEvents('Nouns');
               return option
                  .setName('event')
                  .setDescription('The event to remove.')
                  .setRequired(true)
                  .addChoices(...nounsEvents);
            })
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription('The feed channel.')
                  .setRequired(false);
            });
      }),

   async execute() {
      Logger.info('commands/slash/feeds/nouns-dao.js: Executed feeds command.');
   },
};
