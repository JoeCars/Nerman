const { SlashCommandBuilder } = require('@discordjs/builders');

const Logger = require('../../helpers/logger');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman')
      .setDescription('Nerman Global Command Prefix')
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-poll')
            .setDescription('Create a poll in the current channel.'),
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-poll-channel')
            .setDescription('Create voting channel configuration.'),
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('noun')
            .setDescription('Get the PNG of specified Noun:  /noun 3')
            .addIntegerOption(option =>
               option
                  .setName('int')
                  .setDescription('Enter noun id')
                  .setRequired(true),
            ),
      )
      .addSubcommand(
         subcommand =>
            subcommand
               .setName('address')
               .setDescription(
                  'Retrieve a tile of Nouns owned by a nouner.  Command Structure: /nouner <ETH Address || ENS Name>',
               )
               .addStringOption(option =>
                  option
                     .setName('target')
                     .setDescription('Enter a ENS name or wallet address')
                     .setRequired(true),
               ),
         // disabled until we find a better solution for how to output the tile
         // .addBooleanOption(option =>
         //    option
         //       .setName('delegates')
         //       .setDescription(
         //          'Include Nouns delegated to this address on the output tile? (This is false if left blank)'
         //       )
         // )
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('threshold')
            .setDescription(
               'Displays # of reactions required to tweet message',
            ),
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('participation')
            .setDescription(
               'Check user voting participation in current channel.',
            )
            .addStringOption(option =>
               option
                  .setName('discord-id')
                  .setDescription(
                     "Enter user's Discord ID. Checks your own participation, if left blank.",
                  )
                  .setRequired(false),
            ),
      )
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
            .setName('regenerate-poll-message')
            .setDescription('ADMIN ONLY, regenerate poll message.')
            .addStringOption(option =>
               option
                  .setName('message-id')
                  .setDescription(
                     'Add the ID of the poll message you want to regenerate',
                  )
                  .setRequired(true),
            )
            .addBooleanOption(option =>
               option
                  .setName('embed-only')
                  .setDescription('Target only the embed? (in testing)')
                  .setRequired(false),
            )
            .addBooleanOption(option =>
               option
                  .setName('no-original-message')
                  .setDescription(
                     'Set to true if you are recreating a poll which has no existing message in the channel.',
                  )
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
      )
      .addSubcommand(subcommand => {
         return subcommand
            .setName('register-nouns-forum')
            .setDescription('Register a nouns forum.')
            .addChannelOption(option => {
               return option
                  .setName('forum-channel')
                  .setDescription(
                     'The forum channel being set to a nouns forum.',
                  )
                  .setRequired(true);
            });
      }),

   async execute() {
      Logger.info('commands/nerman/nerman.js: Executed Nerman command.');
   },
};
