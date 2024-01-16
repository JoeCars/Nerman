const { SlashCommandBuilder } = require('discord.js');

const { filterEvents } = require('../../../../helpers/feeds');
const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('lil-nouns')
      .setDescription('Commands to add and remove LilNouns feeds.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Add LilNouns events.')
            .addStringOption(option => {
               const lilNounsEvents = filterEvents('LilNouns');
               lilNounsEvents.unshift({
                  name: 'All',
                  value: 'all',
               });
               return option
                  .setName('event')
                  .setDescription('The event to register.')
                  .setRequired(true)
                  .addChoices(...lilNounsEvents);
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
            .setDescription('Remove LilNouns events.')
            .addStringOption(option => {
               const lilNounsEvents = filterEvents('LilNouns');
               return option
                  .setName('event')
                  .setDescription('The event to remove.')
                  .setRequired(true)
                  .addChoices(...lilNounsEvents);
            })
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription('The feed channel.')
                  .setRequired(false);
            });
      }),

   async execute() {
      Logger.info('commands/slash/feeds/lil-nouns.js: Executed feeds command.');
   },
};
