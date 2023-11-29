const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const UrlConfig = require('../../../db/schemas/UrlConfig');
const {
   generatePropStatusChangeEmbed,
} = require('../../../views/embeds/contracts/nouns-dao');

module.exports = {
   name: 'propStatusChange',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      try {
         const urls = await UrlConfig.fetchUrls(channel.guildId);
         const statusEmbed = await generatePropStatusChangeEmbed(
            data,
            urls.propUrl,
         );
         await channel.send({
            content: null,
            embeds: [statusEmbed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/propStatusChange.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/propStatusChange.js: Finished generating status change embed.',
         {
            propId: data.id,
            propStatus: data.status,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
