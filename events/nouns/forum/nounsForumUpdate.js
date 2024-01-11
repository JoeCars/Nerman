const { ThreadChannel } = require('discord.js');
const UrlConfig = require('../../../db/schemas/UrlConfig');
const {
   generatePropCreatedEmbed,
   generatePropStatusChangeEmbed,
   generatePropVoteCastEmbed,
} = require('../../../views/embeds/contracts/nouns-dao');
const {
   generateFeedbackSentEmbed,
} = require('../../../views/embeds/contracts/nouns-dao-data');
const {
   generateFederationBidEmbed,
   generateFederationVoteEmbed,
} = require('../../../views/embeds/contracts/federation');
const {
   generatePostUpdateEmbed,
} = require('../../../views/embeds/contracts/propdates');
const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'nounsForumUpdate',

   /**
    *
    * @param {ThreadChannel} thread
    * @param {{eventName: string}} data
    */
   async execute(thread, data) {
      const propUrl = (await UrlConfig.fetchUrls(thread.guildId)).propUrl;
      let embed = undefined;

      switch (data.eventName) {
         case 'PropVoteCast':
            embed = generatePropVoteCastEmbed(data, propUrl);
            embed.title = null;
            break;
         case 'PropCreated':
            embed = generatePropCreatedEmbed(data, propUrl);
            break;
         case 'PropStatusChange':
            embed = generatePropStatusChangeEmbed(data, propUrl);
            break;
         case 'FeedbackSent':
            embed = generateFeedbackSentEmbed(data, propUrl);
            break;
         case 'FederationBidPlaced':
            embed = generateFederationBidEmbed(data, propUrl);
            break;
         case 'FederationVoteCast':
            embed = generateFederationVoteEmbed(data, propUrl);
            break;
         case 'PostUpdate':
            embed = generatePostUpdateEmbed(data, propUrl);
            embed.title = 'Propdate';
            break;
         default:
            Logger.error('events/nounsForumUpdate.js: Unknown data type.', {
               data: data,
               threadId: thread.id,
               guildId: thread.guildId,
            });
            throw new Error('Data does not match any known type.');
      }

      thread
         .send({
            embeds: [embed],
         })
         .catch(error => {
            if (error.code === 50001) {
               Logger.info('events/nounsForumUpdate.js: Missing permissions.', {
                  threadId: thread.id,
                  guildId: thread.guildId,
               });
            } else {
               Logger.error('events/nounsForumUpdate.js: Cannot send embed.', {
                  error: error,
                  threadId: thread.id,
                  guildId: thread.guildId,
               });
            }
         });

      Logger.info('Successfully sent forum embed.');
   },
};
