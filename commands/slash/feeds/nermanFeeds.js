const { SlashCommandBuilder } = require('discord.js');

const Logger = require('../../../helpers/logger');
const events = require('../../../utils/feedEvents');

// Note. Discord supports up to a maximum of 25 drop-down options.
// Hence why we need to filter them.
/**
 * @param {string} group
 * @returns
 */
function filterEvents(group) {
   return [...events.entries()]
      .filter(([key, value]) => {
         const eventGroup = value.split('.')[0];
         const isNouns = eventGroup === group;

         return isNouns;
      })
      .map(([key, value]) => {
         return { name: value, value: key };
      });
}

module.exports = {
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
                  .setDescription('Federation contract events.')
                  .addStringOption(option => {
                     const federationEvents = filterEvents('Federation');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...federationEvents);
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
                  .setName('nouns')
                  .setDescription('Nouns contract events.')
                  .addStringOption(option => {
                     const nounsEvents = filterEvents('Nouns');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...nounsEvents);
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
                  .setDescription('NounsNymz contract events.')
                  .addStringOption(option => {
                     const nounsNymzEvents = filterEvents('NounsNymz');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...nounsNymzEvents);
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
                  .setName('nouns-fork')
                  .setDescription('NounsFork contract events.')
                  .addStringOption(option => {
                     const nounsForkEvents = filterEvents('NounsFork');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...nounsForkEvents);
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
                  .setName('propdates')
                  .setDescription('NounsFork contract events.')
                  .addStringOption(option => {
                     const propdatesEvents = filterEvents('Propdates');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...propdatesEvents);
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
                  .setName('lil-nouns')
                  .setDescription('LilNouns events.')
                  .addStringOption(option => {
                     const lilNounsEvents = filterEvents('LilNouns');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...lilNounsEvents);
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
                  .setName('prop-house')
                  .setDescription('PropHouse events.')
                  .addStringOption(option => {
                     const propHouseEvents = filterEvents('PropHouse');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...propHouseEvents);
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
                  .setName('polls')
                  .setDescription('Polls events. Still needs a poll channel.')
                  .addStringOption(option => {
                     const pollEvents = filterEvents('Polls');
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...pollEvents);
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
      Logger.info('commands/nermanAdmin.js: Executed Nerman Admin command.');
   },
};
