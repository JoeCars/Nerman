const { CommandInteraction, inlineCode } = require('discord.js');
const { Types } = require('mongoose');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const events = require('../../../../utils/feedEvents');

module.exports = {
   subCommand: 'nerman-feeds.add.prop-house',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info(
         'commands/slash/feeds/add/prop-house.js: Adding new event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );

      await authorizeInteraction(interaction, 2);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;
      const event = interaction.options.getString('event');

      const eventResults = [];
      if (event === 'all') {
         const feedEvents = [...events.entries()];
         const propHouseEvents = feedEvents
            .filter(pair => {
               const value = pair[1];
               return value.split('.')[0] === 'PropHouse';
            })
            .map(pair => {
               return pair[0];
            });

         for (const feedEvent of propHouseEvents) {
            const results = await registerFeed(interaction, channel, feedEvent);
            eventResults.push(results);
         }
      } else {
         const results = await registerFeed(interaction, channel, event);
         eventResults.push(results);
      }

      const resultMessage = formatResultMessage(eventResults, channel);

      await interaction.reply({
         ephemeral: true,
         content: resultMessage,
      });

      Logger.info(
         'commands/slashCommands/feeds/add.js: Finished adding new event configuration.',
         {
            userId: interaction.user.id,
            guildId: interaction.guildId,
            channelId: interaction.channelId,
         },
      );
   },
};

function formatResultMessage(eventResults, channel) {
   let resultMessage = '';
   let failedEvents = eventResults.filter(({ isDuplicate }) => {
      return isDuplicate;
   });
   if (failedEvents.length > 0) {
      failedEvents = failedEvents
         .map(result => {
            return inlineCode(events.get(result.event));
         })
         .join(', ');
      resultMessage += failedEvents + ' were already registered.\n';
   }
   let successfulEvents = eventResults.filter(({ isDuplicate }) => {
      return !isDuplicate;
   });
   if (successfulEvents.length > 0) {
      successfulEvents = successfulEvents
         .map(result => {
            return inlineCode(events.get(result.event));
         })
         .join(', ');
      resultMessage += `You have successfully registered ${successfulEvents} to channel ${inlineCode(
         channel.id,
      )}.`;
   }
   return resultMessage;
}

async function fetchPermittedHouses(interaction) {
   const houses = interaction.options.getString('house-addresses');
   if (!houses) {
      return undefined;
   }

   const permittedHouses = houses.split(',').map(address => {
      return {
         address: address.trim(),
      };
   });

   const propHouse = interaction.client.libraries.get('PropHouse');
   for (const house of permittedHouses) {
      const houseDetails = await propHouse.prophouse.query.getHouse(
         house.address,
      );
      house.name = houseDetails.name ?? house.address;
      house.url = `https://prop.house/${house.address}`;
   }

   return permittedHouses;
}

async function registerFeed(interaction, channel, event) {
   try {
      const numOfConfigs = await FeedConfig.countDocuments({
         guildId: interaction.guildId,
         channelId: channel.id,
         eventName: event,
         isDeleted: {
            $ne: true,
         },
      });

      if (numOfConfigs !== 0) {
         return {
            event: event,
            isDuplicate: true,
         };
      }

      const permittedHouses = await fetchPermittedHouses(interaction);

      await FeedConfig.create({
         _id: new Types.ObjectId(),
         guildId: interaction.guildId,
         channelId: channel.id,
         eventName: event,
         options: {
            prophouse: {
               permittedHouses: permittedHouses,
            },
         },
      });

      return {
         event: event,
         isDuplicate: false,
      };
   } catch (error) {
      Logger.error(
         'commands/slash/feeds/add/prop-house.js: Unable to save the configuration.',
         {
            error: error,
         },
      );
      throw new Error(
         'Unable to add notification configuration due to a database issue.',
      );
   }
}
