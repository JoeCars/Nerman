const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const { findPollMessage } = require('../../../helpers/poll/thread');
const {
   generateFederationVoteEmbed,
} = require('../../../views/embeds/federation/voteCast');
const UrlConfig = require('../../../db/schemas/UrlConfig');

module.exports = {
   name: 'threadFederationVoteCast',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      try {
         const pollMessage = await findPollMessage(channel, data.propId);
         if (!pollMessage) {
            return;
         }
         const propUrl = (await UrlConfig.fetchUrls(channel.guildId)).propUrl;
         const threadEmbed = generateFederationVoteEmbed(data, propUrl);
         await pollMessage.thread.send({
            content: null,
            embeds: [threadEmbed],
         });
      } catch (error) {
         return Logger.error(
            'events/poll/threadFederationVoteCast.js: Received error.',
            {
               error: error,
               guildId: channel.guildId,
               channelId: channel.id,
            },
         );
      }

      Logger.info(
         'events/poll/threadFederationVoteCast.js: Finished sending threadFederationVoteCast.',
         {
            guildId: channel.guildId,
            channelId: channel.id,
         },
      );
   },
};
