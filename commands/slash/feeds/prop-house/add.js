const { CommandInteraction } = require('discord.js');

const FeedConfig = require('../../../../db/schemas/FeedConfig');
const Logger = require('../../../../helpers/logger');
const { authorizeInteraction } = require('../../../../helpers/authorization');
const {
   filterEvents,
   formatResultMessage,
} = require('../../../../helpers/feeds');

module.exports = {
   subCommand: 'prop-house.add',
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
      const options = {
         prophouse: {
            permittedHouses: await fetchPermittedHouses(interaction),
         },
      };

      const eventResults = [];
      if (event === 'all') {
         const results = await FeedConfig.registerAllProjectFeeds(
            interaction.guildId,
            channel.id,
            event,
            options,
         );
         eventResults.push(...results);
      } else {
         const results = await FeedConfig.registerFeed(
            interaction.guildId,
            channel.id,
            event,
            options,
         );
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
