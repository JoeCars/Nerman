const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord-modals');

// !test this is going to be testing passing StateOfNouns in as an argument, so I'm attempting to make this a async thang?
module.exports = {
   // module.exports = {
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
            .setDescription('Displays # of reactions required to tweet message')
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('participation')
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
                  .setDescription('Enter name of the role you wish to check')
                  .setRequired(false)
            )
      )
      .addSubcommand(subcommand =>
         subcommand
            .setName('regenerate-poll-message')
            .setDescription('ADMIN ONLY, regenerate poll message.')
            .addStringOption(option =>
               option
                  .setName('message-id')
                  .setDescription(
                     'Add the ID of the poll message you want to regenerate'
                  )
                  .setRequired(true)
            )
            .addBooleanOption(option =>
               option
                  .setName('embed-only')
                  .setDescription(
                     'Target only the embed? (in testing)'
                  )
                  .setRequired(false)
            )
            .addBooleanOption(option =>
               option
                  .setName('no-original-message')
                  .setDescription(
                     'Set to true if you are recreating a poll which has no existing message in the channel.'
                  )
                  .setRequired(false)
            )
      ),
   /**
    *
    * @param {CommandInteraction} interaction
    */
   // !testing to see if SON is successfully passed in through this global space
   async execute(interaction) {
      // console.log('...args FROM NERMAN.JS',...args);
      // console.log(stateOfNouns);

      console.log(
         'interaction.options.getSubcommand:\n',
         interaction.options.getSubcommand()
      );

      // console.log('LOGGING INTERACTION FROM NERMAN.JS\n', interaction);

      // console.log('LOGGING THIS FROM NERMAN.JS\n', this);
      // console.log(
      //    'LOGGING client FROM NERMAN.JS\n',
      //    interaction.client.libraries
      // );
      // console.log(
      //    'LOGGING client FROM NERMAN.JS\n',
      //    interaction.client.libraries.get('Nouns')
      // );
      // console.log(
      //    'LOGGING TO SEE IF STATE OF NOUNS IS PASSED THROUGH THE NERMAN GLOBAL COMMAND HANDLER:\n',
      //    stateOfNouns
      // );
   },
};
// };
