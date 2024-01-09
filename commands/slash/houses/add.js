const { CommandInteraction } = require('discord.js');
const { Types } = require('mongoose');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');
const HouseFilterConfig = require('../../../db/schemas/HouseFilterConfig');

module.exports = {
   subCommand: 'nerman-houses.add',
   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      Logger.info('commands/slash/houses/add.js: Adding house filters.', {
         guildId: interaction.guildId,
         channelId: interaction.channelId,
         userId: interaction.user.id,
      });

      await authorizeInteraction(interaction, 2);

      const channel =
         interaction.options.getChannel('channel') ?? interaction.channel;

      let houseConfig;
      try {
         houseConfig = await HouseFilterConfig.findOne({
            guildId: interaction.guildId,
            channelId: channel.id,
         }).exec();
      } catch (error) {
         Logger.error(
            'commands/slash/houses/add.js: Unable to retrieve HouseFilterConfig due to a database issue.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to register HouseFilterConfig due to a database issue.',
         );
      }

      if (houseConfig) {
         return interaction.reply({
            content:
               'Unable to filter houses for this channel, because it already has a filter registered.\nPlease remove the current filter before trying to add a new one.',
            ephemeral: true,
         });
      }

      const houseAddresses = interaction.options.getString('house-addresses');
      const permittedHouses = houseAddresses.split(',').map(address => {
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

      let newConfig;
      try {
         newConfig = await HouseFilterConfig.create({
            _id: new Types.ObjectId(),
            guildId: interaction.guildId,
            channelId: channel.id,
            permittedHouses: permittedHouses,
         });
      } catch (error) {
         Logger.error(
            'commands/slash/houses/add.js: Unable to retrieve HouseFilterConfig due to a database issue.',
            {
               error: error,
            },
         );
         throw new Error(
            'Unable to register HouseFilterConfig due to a database issue.',
         );
      }

      await interaction.reply({
         content: 'Successfully registered permitted houses to this guild.',
         ephemeral: true,
      });

      Logger.info(
         'commands/slash/houses/add.js: Finished adding house filters.',
         {
            guildId: interaction.guildId,
            interactionChannel: interaction.channelId,
            permittedHouses: newConfig.permittedHouses,
            configChannel: newConfig.channelId,
         },
      );
   },
};
