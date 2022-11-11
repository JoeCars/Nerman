const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord-modals');

module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman')
      .setDescription('Nerman Global Command Prefix')
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-poll')
            .setDescription('Create a poll in the current channel.')
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('create-poll-channel')
            .setDescription('Create voting channel configuration.')
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('noun')
            .setDescription('Get the PNG of specified Noun:  /noun 3')
            .addIntegerOption(option =>
               option.setName('int').setDescription('Enter noun id')
            )
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('nouner')
            .setDescription(
               'Retrieve a tile of Nouns owned by a nouner.  Command Structure: /nouner <ETH Address || ENS Name>'
            )
            .addStringOption(option =>
               option
                  .setName('target')
                  .setDescription('Enter a ENS name or wallet address')
                  .setRequired(true)
            )
            .addBooleanOption(option =>
               option
                  .setName('delegates')
                  .setDescription(
                     'Include Nouns delegated to this address? (This is false if left blank)'
                  )
            )
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('threshold')
            .setDescription('Displays # of reactions required to tweet message')
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('check-participation')
            .setDescription('Check user voting participation in given channel')
            .addStringOption(option =>
               option
                  .setName('discord-id')
                  .setDescription("Enter user's Discord ID")
                  .setRequired(true)
            )
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('admin-check-voters')
            .setDescription(
               'Admin only and temporary, for gathering the names of the voting role members'
            )
            .addStringOption(option =>
               option
                  .setName('role-name')
                  .setDescription("Enter name of the role you wish to check")
                  .setRequired(false)
            )
      ),
   /**
    *
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      console.log(
         'interaction.options.getSubcommand:\n',
         interaction.options.getSubcommand()
      );
   },
};
