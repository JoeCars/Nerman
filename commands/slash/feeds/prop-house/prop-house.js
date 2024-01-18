const { SlashCommandBuilder } = require('discord.js');

const { filterEvents } = require('../../../../helpers/feeds');
const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('prophouse')
      .setDescription('Commands to add and remove PropHouse feeds.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Add PropHouse events.')
            .addStringOption(option => {
               const propHouseEvents = filterEvents('PropHouse');
               propHouseEvents.unshift({
                  name: 'All',
                  value: 'all',
               });
               return option
                  .setName('event')
                  .setDescription('The event to register.')
                  .setRequired(true)
                  .addChoices(...propHouseEvents);
            })
            .addStringOption(option => {
               return option
                  .setName('house-addresses')
                  .setDescription('Permitted House events.')
                  .setRequired(false);
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
            .setDescription('Remove PropHouse events.')
            .addStringOption(option => {
               const propHouseEvents = filterEvents('PropHouse');
               return option
                  .setName('event')
                  .setDescription('The event to remove.')
                  .setRequired(true)
                  .addChoices(...propHouseEvents);
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
         'commands/slash/feeds/prophouse.js: Executed feeds command.',
      );
   },
};
