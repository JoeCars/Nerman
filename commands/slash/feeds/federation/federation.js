const { SlashCommandBuilder } = require('discord.js');

const { filterEvents } = require('../../../../helpers/feeds');
const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('federation')
      .setDescription('Commands to add and remove Federation feeds.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Add Federation events.')
            .addStringOption(option => {
               const federationEvents = filterEvents('Federation');
               federationEvents.unshift({
                  name: 'All',
                  value: 'all',
               });
               return option
                  .setName('event')
                  .setDescription('The event to register.')
                  .setRequired(true)
                  .addChoices(...federationEvents);
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
            .setDescription('Remove Federation events.')
            .addStringOption(option => {
               const federationEvents = filterEvents('Federation');
               return option
                  .setName('event')
                  .setDescription('The event to remove.')
                  .setRequired(true)
                  .addChoices(...federationEvents);
            })
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription('The feed channel.')
                  .setRequired(false);
            });
      }),

   async execute() {
      Logger.info(
         'commands/slash/feeds/federation.js: Executed feeds command.',
      );
   },
};
