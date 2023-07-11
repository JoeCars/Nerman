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
      Logger.info(
         'events/customEvents/nouns/delegateChanged.js: Sending delegate change notification.',
         {
            delegator: data.delegator.id,
            newDelegate: data.toDelegate.id,
            channelId: channel.id,
            numOfVotesChanged: data.numOfVotesChanged,
         },
      );

      const nouns = channel.client.libraries.get('Nouns');

      const notificationEmbed = await generateDelegateChangedEmbed(
         nouns,
         data,
         false,
      );
      const message = await channel.send({ embeds: [notificationEmbed] });

      const embed = await generateDelegateChangedEmbed(nouns, data);
      await message.edit({ embeds: [embed] });

      Logger.info(
         'events/customEvents/nouns/delegateChanged.js: Finished sending delegate change notification.',
         {
            delegator: data.delegator.id,
            newDelegate: data.toDelegate.id,
            channelId: channel.id,
            numOfVotesChanged: data.numOfVotesChanged,
         },
      );
   },
};
