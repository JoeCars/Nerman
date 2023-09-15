const { TextChannel } = require('discord.js');

const {
   generatePostUpdateEmbed,
} = require('../../../../views/embeds/propdates/postUpdate');
const Logger = require('../../../../helpers/logger');

module.exports = {
   name: 'postUpdate',
   /**
    *
    * @param {TextChannel} channel
    * @param {{
    * 	propId: number,
    * 	isComplete: boolean,
    *	update: string
    * 	proposalTitle: string
    * }} data
    */
   async execute(channel, data) {
      try {
         const embed = generatePostUpdateEmbed(data);
         await channel.send({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/nouns/federation/postUpdate.js: Received error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/federation/postUpdate.js: Finished sending postUpdate embed.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
