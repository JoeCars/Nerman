const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateAuctionCreatedEmbed,
} = require('../../../views/embeds/auctionCreated');

module.exports = {
   name: 'auctionCreated',
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
         const embed = generateAuctionCreatedEmbed(data);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/customEvents/nouns/auctionCreated.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/auctionCreated.js: Successfully handled an auction creation event.',
         {
            id: data.id,
            startTime: data.startTime,
            endTime: data.endTime,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
