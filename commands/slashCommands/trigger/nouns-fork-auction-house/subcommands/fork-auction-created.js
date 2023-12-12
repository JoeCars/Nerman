const { CommandInteraction } = require('discord.js');

const Logger = require('../../../../../helpers/logger');
const {
   authorizeInteraction,
} = require('../../../../../helpers/authorization');

const DEFAULT_NOUN_ID = 117;

module.exports = {
   subCommand: 'trigger-nouns-fork-auction-house.fork-auction-created',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      await authorizeInteraction(interaction, 4);

      const nounId =
         interaction.options.getNumber('noun-number') ?? DEFAULT_NOUN_ID;

      const nounsForkAuctionHouse = interaction.client.libraries.get(
         'NounsForkAuctionHouse',
      );
      nounsForkAuctionHouse.trigger('AuctionCreated', {
         id: nounId,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered a ForkAuctionCreated event.',
      });

      Logger.info(
         'commands/trigger-nouns-fork-auction-house.fork-auction-created.js: Event triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
