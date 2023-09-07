const { ThreadChannel } = require('discord.js');
const UrlConfig = require('../../../../db/schemas/UrlConfig');
const {
   generatePropCreatedEmbed,
} = require('../../../../views/embeds/propCreated');
const {
   generatePropStatusChangeEmbed,
} = require('../../../../views/embeds/propStatusChange');
const {
   generatePropVoteCastEmbed,
} = require('../../../../views/embeds/propVoteCast');
const {
   generateFeedbackSentEmbed,
} = require('../../../../views/embeds/feedbackSent');
const {
   generateFederationBidEmbed,
} = require('../../../../views/embeds/federation/bidPlaced');
const {
   generateFederationVoteEmbed,
} = require('../../../../views/embeds/federation/voteCast');
const Logger = require('../../../../helpers/logger');

module.exports = {
   name: 'nounsForumUpdate',

   /**
    *
    * @param {ThreadChannel} thread
    * @param {{nounsForumType: string}} data
    */
   async execute(thread, data) {
      const propUrl = (await UrlConfig.fetchUrls(thread.guildId)).propUrl;
      let embed = undefined;

      switch (data.nounsForumType) {
         case 'PropVoteCast':
            embed = generatePropVoteCastEmbed(data, propUrl);
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
         default:
            Logger.error('events/nounsForumUpdate.js: Unknown data type.', {
               data: data,
            });
            throw new Error('Data does not match any known type.');
      }

      thread.send({
         embeds: [embed],
      });

      Logger.info('Successfully sent forum embed.');
   },
};
