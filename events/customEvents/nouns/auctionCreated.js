const { MessageEmbed, Channel } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');

const Logger = require('../../../helpers/logger');
const {
   generateAuctionCreatedEmbed,
} = require('../../../views/embeds/auctionCreated');

module.exports = {
   name: 'auctionCreated',
   /**
    *
    * @param {Channel} genChannel
    */
   async execute(genChannel, data) {
      Logger.info(
         'events/nouns/auctionCreated.js: Attempting to handle an auction creation event.',
         {
            id: `${data.id}`,
            startTime: data.startTime,
            endTime: data.endTime,
         },
      );

      try {
         const embed = generateAuctionCreatedEmbed(data);
         await genChannel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/customEvents/nouns/auctionCreated.js: Received an error.',
            {
               error: error,
            },
         );
      }

      Logger.info(
         'events/nouns/auctionCreated.js: Successfully handled an auction creation event.',
         {
            id: data.id,
            startTime: data.startTime,
            endTime: data.endTime,
         },
      );
   },
};
