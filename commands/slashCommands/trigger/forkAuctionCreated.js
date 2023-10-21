const { CommandInteraction } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Logger = require('../../../helpers/logger');
const { authorizeInteraction } = require('../../../helpers/authorization');

const DEFAULT_NOUN_ID = 117;

module.exports = {
   data: new SlashCommandBuilder()
      .setName('trigger-fork-auction-created')
      .setDescription('Trigger an auction created event.')
      .addNumberOption(option => {
         return option
            .setName('noun-number')
            .setDescription('The noun being auctioned.')
            .setRequired(process.env.DEPLOY_STAGE !== 'development');
      }),

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
         'commands/trigger/forkAuctionCreated.js: A forkAuctionCreated event has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
