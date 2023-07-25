const { CommandInteraction } = require('discord.js');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

const DEFAULT_NOUN_ID = 117;

module.exports = {
   subCommand: 'nerman-trigger.auction-created',

   /**
    * @param {CommandInteraction} interaction
    */
   async execute(interaction) {
      const guildUser = await interaction.guild.members.fetch(
         interaction.user.id,
      );
      if (!(await isUserAuthorized(4, guildUser))) {
         throw new Error('This is an admin-only command');
      }

      const nounId =
         interaction.options.getNumber('noun-number') ?? DEFAULT_NOUN_ID;

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('AuctionCreated', {
         id: nounId,
      });

      interaction.reply({
         ephemeral: true,
         content: 'Triggered an AuctionCreated event.',
      });

      Logger.info(
         'commands/trigger/auctionCreated.js: An auction created has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
