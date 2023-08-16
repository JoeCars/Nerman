const { TextChannel } = require('discord.js');
const Logger = require('../../../helpers/logger');
const UrlConfig = require('../../../db/schemas/UrlConfig');
const { generateAuctionEndEmbed } = require('../../../views/embeds/auctionEnd');

module.exports = {
   name: 'auctionEnd',
   /**
    *
    * @param {TextChannel} channel
    * @param {{
    *    id: number,
    *    winner: {id: string, name: string}
    *    amount: BigNumber
    * }} data
    */
   async execute(channel, data) {
      try {
         const propUrl = (await UrlConfig.fetchUrls(channel.guildId)).propUrl;
         const embed = generateAuctionEndEmbed(data, propUrl);
         await channel.send({
            content: null,
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error('events/nouns/auctionEnd.js: Received an error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/nouns/auctionEnd.js: Finished generating auction end embed.',
         {
            nounId: data.id,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
