const { CommandInteraction } = require('discord.js');
const Logger = require('../../../helpers/logger');
const { isUserAuthorized } = require('../../../helpers/authorization');

module.exports = {
   subCommand: 'nerman.trigger.auction-bid',

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

      const Nouns = interaction.client.libraries.get('Nouns');
      Nouns.trigger('AuctionBid', {
         id: 69,
         amount: '69690000000000000000',
         bidder: {
            id: '0x281eC184E704CE57570614C33B3477Ec7Ff07243',
         },
      });

      interaction.reply({
         ephemeral: true,
         content: 'Trigger an AuctionBid event.',
      });

      Logger.info(
         'commands/trigger/auctionBid.js: An auction bid has been triggered.',
         {
            guildId: interaction.guildId,
            channelId: interaction.channelId,
            userId: interaction.user.id,
         },
      );
   },
};
