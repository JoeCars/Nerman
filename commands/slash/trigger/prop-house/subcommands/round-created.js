const { CommandInteraction } = require('discord.js');
const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_CREATOR = '0x281eC184E704CE57570614C33B3477Ec7Ff07243';
const DEFAULT_ROUND = '0xe3ce3916c95b6f2a23a0601426b2c47b960100d8';
const DEFAULT_HOUSE = '0x84ae050b4861c59f25be37352a66a3f1e0328aaf';
const DEFAULT_TITLE = 'Round 11';

module.exports = {
   subCommand: 'trigger-prop-house.round-created',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const creator =
         interaction.options.getString('creator') ?? DEFAULT_CREATOR;
      const round = interaction.options.getString('round') ?? DEFAULT_ROUND;
      const title = interaction.options.getString('title') ?? DEFAULT_TITLE;

      const propHouse = interaction.client.libraries.get('PropHouse');
      propHouse.trigger('RoundCreated', {
         creator: {
            id: creator,
         },
         round: {
            id: round,
         },
         house: {
            id: DEFAULT_HOUSE,
         },
         title,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a RoundCreated event.',
      });

      Logger.info(
         'commands/trigger-prop-house.round-created.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
