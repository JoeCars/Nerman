const { SlashCommandBuilder } = require('discord.js');

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

function filterNounsContractEvents() {
   return [...events.entries()]
      .filter(([key, value]) => {
         const eventGroup = value.split('.')[0];
         const isNounsDAO = eventGroup === 'NounsDAO';
         const isNounsAuctionHouse = eventGroup === 'NounsAuctionHouse';
         const isNounsToken = eventGroup === 'NounsToken';
         const isNounsDAOData = eventGroup === 'NounsDAOData';

         return (
            isNounsDAO || isNounsAuctionHouse || isNounsToken || isNounsDAOData
         );
      })
      .map(([key, value]) => {
         return [value, key];
      });
}

function filterLilNounsEvents() {
   return [...events.entries()]
      .filter(([key, value]) => {
         const eventGroup = value.split('.')[0];
         const isLilNouns = eventGroup === 'LilNouns';

         return isLilNouns;
      })
      .map(([key, value]) => {
         return [value, key];
      });
}

function filterNounsOtherEvents() {
   return [...events.entries()]
      .filter(([key, value]) => {
         const eventGroup = value.split('.')[0];
         const isNounsDAO = eventGroup === 'NounsDAO';
         const isNounsAuctionHouse = eventGroup === 'NounsAuctionHouse';
         const isNounsToken = eventGroup === 'NounsToken';
         const isNounsDAOData = eventGroup === 'NounsDAOData';
         const isLilNouns = eventGroup === 'LilNouns';

         return !(
            isNounsDAO ||
            isNounsAuctionHouse ||
            isNounsToken ||
            isNounsDAOData ||
            isLilNouns
         );
      })
      .map(([key, value]) => {
         return [value, key];
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
                  .setName('nouns-contracts')
                  .setDescription('Nouns contract events.')
                  .addStringOption(option => {
                     const nounsEvents = filterNounsContractEvents();
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
                  .setName('lil-nouns')
                  .setDescription('LilNouns events.')
                  .addStringOption(option => {
                     const lilNounsEvents = filterLilNounsEvents();
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
                  .setName('nouns-others')
                  .setDescription('General nouns events.')
                  .addStringOption(option => {
                     const generalEvents = filterNounsOtherEvents();
                     return option
                        .setName('event')
                        .setDescription('The event to register.')
                        .setRequired(true)
                        .addChoices(...generalEvents);
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
