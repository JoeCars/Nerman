const { SlashCommandBuilder } = require('discord.js');
const Logger = require('../../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('feeds')
      .setDescription(
         'Commands to register, remove, and display feeds from a channel.',
      )
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add')
            .setDescription('Register a feed to this channel.')
            .addStringOption(option => {
               return option
                  .setName('event')
                  .setDescription('The event to register.')
                  .setRequired(true);
            })
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription(
                     'The channel that will receive the notifications.',
                  )
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('add-all')
            .setDescription(
               'Add all event configurations to the given channel.',
            )
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription(
                     'The channel that will receive all notifications. The current channel by default.',
                  )
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('remove-all')
            .setDescription(
               'Remove all event configurations for the given channel.',
            )
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription(
                     'The channel that will lose the notifications. The current channel by default.',
                  )
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('remove')
            .setDescription('Remove the event configuration for the channel.')
            .addStringOption(option => {
               return option
                  .setName('event')
                  .setDescription('The event to be removed.')
                  .setRequired(true);
            })
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription(
                     'The channel that will lose the notification. The current channel by default.',
                  )
                  .setRequired(false);
            });
      })
      .addSubcommand(subcommand => {
         return subcommand
            .setName('display')
            .setDescription(
               'Display the event configuration of the given channel.',
            )
            .addChannelOption(option => {
               return option
                  .setName('channel')
                  .setDescription(
                     'The channel whose notifications you want to check.',
                  )
                  .setRequired(false);
            });
      }),

   async execute() {
      Logger.info('commands/feeds.js: Executed feeds command.');
   },
};
