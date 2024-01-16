const { SlashCommandBuilder } = require('discord.js');

const { filterEvents } = require('../../../../helpers/feeds');
const Logger = require('../../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('nouns-fork')
      .setDescription('Commands to add and remove NounsFork feeds.')
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Add NounsFork events.')
            .addStringOption(option => {
               const nounsForkEvents = filterEvents('NounsFork');
               nounsForkEvents.unshift({
                  name: 'All',
                  value: 'all',
               });
               return option
                  .setName('event')
                  .setDescription('The event to register.')
                  .setRequired(true)
                  .addChoices(...nounsForkEvents);
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
            .setDescription('Remove NounsFork events.')
            .addStringOption(option => {
               const nounsForkEvents = filterEvents('NounsFork');
               return option
                  .setName('event')
                  .setDescription('The event to remove.')
                  .setRequired(true)
                  .addChoices(...nounsForkEvents);
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
         'commands/slash/feeds/nouns-fork.js: Executed feeds command.',
      );
   },
};
