const { SlashCommandBuilder } = require('discord.js');

const { filterEvents } = require('../../../../helpers/feeds');
const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('farcaster')
      .setDescription('Commands to add and remove Farcaster feeds.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Add Farcaster events.')
            .addStringOption(option => {
               const farcasterEvents = filterEvents('Farcaster');
               farcasterEvents.unshift({
                  name: 'All',
                  value: 'all',
               });
               return option
                  .setName('event')
                  .setDescription('The event to register.')
                  .setRequired(true)
                  .addChoices(...farcasterEvents);
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
            .setDescription('Remove Farcaster events.')
            .addStringOption(option => {
               const farcasterEvents = filterEvents('Farcaster');
               return option
                  .setName('event')
                  .setDescription('The event to remove.')
                  .setRequired(true)
                  .addChoices(...farcasterEvents);
            })
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription('The feed channel.')
                  .setRequired(false);
            });
      }),

   async execute() {
      Logger.info('commands/slash/feeds/farcaster.js: Executed feeds command.');
   },
};
