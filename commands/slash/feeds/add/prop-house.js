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

      if (!channel || !event) {
         throw new Error('The channel and event were not supplied.');
      }

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
            return interaction.reply({
               ephemeral: true,
               content: 'This event is already registered to this channel.',
            });
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

      const eventName = events.get(event);

      await interaction.reply({
         ephemeral: true,
         content: `You have successfully registered the ${inlineCode(
            eventName,
         )} event to channel ${inlineCode(channel.id)}.`,
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
