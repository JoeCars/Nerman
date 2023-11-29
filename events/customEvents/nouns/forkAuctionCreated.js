const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateForkAuctionCreatedEmbed,
} = require('../../../views/embeds/contracts/nouns-fork-auction-house');

module.exports = {
   name: 'forkAuctionCreated',
   /**
    *
    * @param {TextChannel} channel
    * @param {{
    *    id: string,
    *    startTime: string,
    *    endTime: string
    * }} data
    */
   async execute(channel, data) {
      try {
         const embed = generateForkAuctionCreatedEmbed(data);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/customEvents/nouns/forkAuctionCreated.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/forkAuctionCreated.js: Successfully handled a forkAuctionCreated event.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
