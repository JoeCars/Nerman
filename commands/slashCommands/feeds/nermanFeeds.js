const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const events = require('../../../utils/feedEvents');

// Note. Discord supports up to a maximum of 25 drop-down options.
// Hence why we need to filter them.
function filterEvent(group) {
   return [...events.entries()]
      .filter(([key, value]) => {
         const eventGroup = value.split('.')[0];
         return eventGroup === group;
      })
      .map(([key, value]) => {
         return [value.split('.')[1], key];
      });
}

module.exports = {
   // module.exports = {
   data: new SlashCommandBuilder()
      .setName('nerman-feeds')
      .setDescription(
         'Commands to register, remove, and display feeds from a channel.',
      )
      .addSubcommandGroup(subcommandGroup => {
         return subcommandGroup
            .setName('add')
            .setDescription('Add an event configuration for the given channel.')
            .addSubcommand(subcommand => {
               return subcommand
                  .setName('federation')
                  .setDescription('Federation events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvent('Federation');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(federationEvents);
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
                  .setName('nerman-poll')
                  .setDescription('NermanPoll events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvent('NermanPoll');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(federationEvents);
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
                  .setName('nouns-dao-auctions')
                  .setDescription('NounsDAOAuctions events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvent('NounsDAOAuctions');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(federationEvents);
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
                  .setName('nouns-dao-tokens')
                  .setDescription('NounsDAOTokens events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvent('NounsDAOTokens');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(federationEvents);
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
                  .setName('nouns-dao-proposals')
                  .setDescription('NounsDAOProposals events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvent('NounsDAOProposals');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(federationEvents);
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
                  .setName('nouns-dao-candidates')
                  .setDescription('NounsDAOCandidates events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvent('NounsDAOCandidates');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(federationEvents);
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
                  .setName('nouns-dao-fork')
                  .setDescription('NounsDAOFork events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvent('NounsDAOFork');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(federationEvents);
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
                  .setName('nouns-nymz')
                  .setDescription('NounsNymz events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvent('NounsNymz');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(federationEvents);
                  })
                  .addChannelOption(option => {
                     return option
                        .setName('channel')
                        .setDescription(
                           'The channel that will receive the notifications.',
                        )
                        .setRequired(false);
                  });
            });
      })
      .addSubcommand(subcommand => {
         return (
            subcommand
               .setName('remove')
               .setDescription(
                  'Remove an event configuration for the given channel.',
               )
               // .addStringOption(option => {
               //    // const eventOptions = [];
               //    // events.forEach((value, key) => {
               //    //    eventOptions.push([value, key]);
               //    // });
               //    return option
               //       .setName('event')
               //       .setDescription('The event to remove.')
               //       .setRequired(true)
               //       .addChoices(eventOptions);
               // })
               .addChannelOption(option => {
                  return option
                     .setName('channel')
                     .setDescription(
                        'The channel that will lose the notifications.',
                     )
                     .setRequired(false);
               })
         );
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
      Logger.info('commands/nermanAdmin.js: Executed Nerman Admin command.');
   },
};
