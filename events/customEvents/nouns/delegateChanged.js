const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateDelegateChangedEmbed,
} = require('../../../views/embeds/delegateChanged');

module.exports = {
   name: 'delegateChanged',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      const notificationEmbed = generateDelegateChangedEmbed(data, false);
      const embed = generateDelegateChangedEmbed(data);

      try {
         const message = await channel.send({ embeds: [notificationEmbed] });
         await message.edit({ embeds: [embed] });
      } catch (error) {
         return Logger.error(
            'events/nouns/delegateChanged.js: Received error.',
            { error: error, channelId: channel.id, guildId: channel.guildId },
         );
      }

      Logger.info(
         'events/nouns/delegateChanged.js: Finished sending delegate change notification.',
         {
            delegator: data.delegator.id,
            newDelegate: data.toDelegate.id,
            numOfVotesChanged: data.numOfVotesChanged,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
