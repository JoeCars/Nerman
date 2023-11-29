const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateTransferNounEmbed,
} = require('../../../views/embeds/contracts/nouns-token');

module.exports = {
   name: 'transferNoun',
   /**
    * @param {TextChannel} channel
    * @param {{
    *    from: {id: string, name: string},
    *    to: {id: string, name: string},
    *    tokenId: string}} data
    */
   async execute(channel, data) {
      const embed = generateTransferNounEmbed(data);

      try {
         await channel.send({
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error('events/nouns/transferNoun.js: Received error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/nouns/transferNoun.js: Successfully sent Transfer Noun embed..',
         {
            channelId: channel.id,
            guildId: channel.guildId,
            nounId: data.tokenId,
         },
      );
   },
};
