const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateTransferForkNounEmbed,
} = require('../../../views/embeds/contracts/nouns-fork-token');

module.exports = {
   name: 'transferForkNoun',
   /**
    * @param {TextChannel} channel
    * @param {{
    *    from: {id: string, name: string},
    *    to: {id: string, name: string},
    *    tokenId: string}} data
    */
   async execute(channel, data) {
      const noticeEmbed = generateTransferForkNounEmbed(data);

      try {
         await channel.send({
            embeds: [noticeEmbed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/transferForkNoun.js: Received error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/transferForkNoun.js: Successfully sent transferForkNoun embed.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
