const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generatePropCreatedEmbed,
} = require('../../../views/embeds/propCreated');
const UrlConfig = require('../../../db/schemas/UrlConfig');

module.exports = {
   name: 'propCreated',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, proposal) {
      Logger.info(
         'events/nouns/propCreated.js: Generating propCreated embed.',
         {
            propId: proposal.id,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );

      try {
         const propUrl = (await UrlConfig.fetchUrls(channel.guildId)).propUrl;
         const embed = generatePropCreatedEmbed(proposal, propUrl);
         await channel.send({
            content: null,
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/propCreated.js: Received an error.',
            {
               error: error,
            },
         );
      }

      Logger.info(
         'events/nouns/propCreated.js: Finished generating propCreated embed.',
         {
            propId: proposal.id,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
