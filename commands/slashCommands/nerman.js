const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord-modals');

const Logger = require('../../helpers/logger');
const events = require('../../utils/feedEvents');

// !test this is going to be testing passing Nerman.js in as an argument, so I'm attempting to make this a async thang?
module.exports = {
   // module.exports = {
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
      .addSubcommandGroup(subcommandGroup => {
         return subcommandGroup
            .setName('feeds')
            .setDescription(
               'Commands to register, remove, and remove feeds from a channel.',
            )
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('add')
                  .setDescription(
                     'Add an event configuration for the given channel.',
                  )
                  .addStringOption(option => {
                     const eventOptions = [];
                     events.forEach((value, key) => {
                        eventOptions.push([value, key]);
                     });
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(eventOptions);
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
                  .setName('remove')
                  .setDescription(
                     'Remove an event configuration for the given channel.',
                  )
                  .addStringOption(option => {
                     const eventOptions = [];
                     events.forEach((value, key) => {
                        eventOptions.push([value, key]);
                     });
                     return option
                        .setName('event')
                        .setDescription('The event to remove.')
                        .setRequired(true)
                        .addChoices(eventOptions);
                  })
                  .addChannelOption(option => {
                     return option
                        .setName('channel')
                        .setDescription(
                           'The channel that will lose the notifications.',
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
            });
      })
      .addSubcommandGroup(subcommandGroup => {
         return subcommandGroup
            .setName('admin')
            .setDescription(
               'Commands to add, remove, and display the guild admins.',
            )
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('add')
                  .setDescription('Give a user admin privileges for Nerman.')
                  .addUserOption(option => {
                     return option
                        .setName('user')
                        .setDescription('The user being turned into an admin.')
                        .setRequired(true);
                  });
            })
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('remove')
                  .setDescription(
                     "Removing a user' admin privileges for Nerman.",
                  )
                  .addUserOption(option => {
                     return option
                        .setName('user')
                        .setDescription('The user being removed from an admin.')
                        .setRequired(true);
                  });
            })
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('display')
                  .setDescription('Displaying the admin users in this guild.');
            });
      })
      .addSubcommandGroup(subcommandGroup => {
         return subcommandGroup
            .setName('url')
            .setDescription(
               'Commands to add, remove, and display the guild URLs.',
            )
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('add')
                  .setDescription('Register a new set of URLs for this guild.')
                  .addStringOption(option => {
                     return option
                        .setName('proposal-url')
                        .setDescription('The URL for all future proposals.')
                        .setRequired(false);
                  })
                  .addStringOption(option => {
                     return option
                        .setName('noun-url')
                        .setDescription('The URL for all future Nouns.')
                        .setRequired(false);
                  });
            })
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('remove')
                  .setDescription(
                     'Removing the URLs registered to this guild.',
                  );
            })
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('display')
                  .setDescription(
                     'Displaying the URLs registered to this guild.',
                  );
            });
      })
      .addSubcommandGroup(subcommandGroup => {
         return subcommandGroup
            .setName('trigger')
            .setDescription('Trigger a specific event.')
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('auction-bid')
                  .setDescription('Trigger an auction bid event.')
                  .addStringOption(option => {
                     return option
                        .setName('bidder-address')
                        .setDescription("The bidder's wallet address.")
                        .setRequired(false);
                  })
                  .addNumberOption(option => {
                     return option
                        .setName('ethereum-amount')
                        .setDescription('The amount of Eth being bid.')
                        .setRequired(false);
                  })
                  .addNumberOption(option => {
                     return option
                        .setName('noun-number')
                        .setDescription('The noun being bid on.')
                        .setRequired(false);
                  });
            })
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('auction-created')
                  .setDescription('Trigger an auction created event.')
                  .addNumberOption(option => {
                     return option
                        .setName('noun-number')
                        .setDescription('The noun being auctioned.')
                        .setRequired(false);
                  });
            })
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('delegate-changed')
                  .setDescription('Trigger a delegate changed event.')
                  .addStringOption(option => {
                     return option
                        .setName('delegator-id')
                        .setDescription("The delegator's wallet address.")
                        .setRequired(false);
                  })
                  .addStringOption(option => {
                     return option
                        .setName('new-delegate-id')
                        .setDescription("The new delegate's wallet address.")
                        .setRequired(false);
                  })
                  .addNumberOption(option => {
                     return option
                        .setName('nouns-transferred')
                        .setDescription(
                           'The number of nouns being transferred.',
                        )
                        .setRequired(false);
                  });
            })
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('noun-created')
                  .setDescription('Trigger a noun created event.')
                  .addNumberOption(option => {
                     return option
                        .setName('noun-id')
                        .setDescription('The noun created.')
                        .setRequired(false);
                  });
            })
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('prop-created')
                  .setDescription('Trigger a prop created event.')
                  .addNumberOption(option => {
                     return option
                        .setName('proposal-number')
                        .setDescription('The proposal number.')
                        .setRequired(false);
                  })
                  .addStringOption(option => {
                     return option
                        .setName('proposal-title')
                        .setDescription('The proposal title.')
                        .setRequired(false);
                  });
            });
      }),
   /**
    *
    * @param {CommandInteraction} interaction
    */
   // !testing to see if SON is successfully passed in through this global space
   async execute(interaction) {
      Logger.info('commands/nerman/nerman.js: Executed Nerman command.');
   },
};
