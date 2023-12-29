const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_CREATOR = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_HOUSE = '0x84ae050b4861c59f25be37352a66a3f1e0328aaf';

module.exports = {
   subCommand: 'trigger-prop-house.house-created',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const creator =
         interaction.options.getString('creator') ?? DEFAULT_CREATOR;
      const house = interaction.options.getString('house') ?? DEFAULT_HOUSE;

      const propHouse = interaction.client.libraries.get('PropHouse');
      propHouse.trigger('HouseCreated', {
         creator: {
            id: creator,
         },
         house: {
            id: house,
         },
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a HouseCreated event.',
      });

      Logger.info(
         'commands/trigger-prop-house.house-created.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
