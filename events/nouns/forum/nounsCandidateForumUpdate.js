const { ThreadChannel } = require('discord.js');
const UrlConfig = require('../../../db/schemas/UrlConfig');
const {
   generateCandidateFeedbackSentEmbed,
   generateProposalCandidateCanceledEmbed,
   generateProposalCandidateCreatedEmbed,
   generateProposalCandidateUpdatedEmbed,
   generateSignatureAddedEmbed,
} = require('../../../views/embeds/contracts/nouns-dao-data');
const Logger = require('../../../helpers/logger');

module.exports = {
   name: 'nounsCandidateForumUpdate',

   /**
    *
    * @param {ThreadChannel} thread
    * @param {{nounsForumType: string}} data
    */
   async execute(thread, data) {
      const propUrl = (await UrlConfig.fetchUrls(thread.guildId)).propUrl;
      let embed = undefined;

      switch (data.nounsForumType) {
         case 'CandidateFeedbackSent':
            embed = generateCandidateFeedbackSentEmbed(data, propUrl);
            embed.title = 'New Candidate Feedback';
            break;
         case 'ProposalCandidateCanceled':
            embed = generateProposalCandidateCanceledEmbed(data, propUrl);
            break;
         case 'ProposalCandidateCreated':
            embed = generateProposalCandidateCreatedEmbed(data, propUrl);
            embed.title = 'New Proposal Candidate';
            break;
         case 'ProposalCandidateUpdated':
            embed = generateProposalCandidateUpdatedEmbed(data, propUrl);
            break;
         case 'SignatureAdded':
            embed = generateSignatureAddedEmbed(data, propUrl);
            embed.title = 'Candidate Proposal Signed';
            break;
         default:
            Logger.error(
               'events/nounsCandidateForumUpdate.js: Unknown data type.',
               {
                  data: data,
                  threadId: thread.id,
                  guildId: thread.guildId,
               },
            );
            throw new Error('Data does not match any known type.');
      }

      thread
         .send({
            embeds: [embed],
         })
         .catch(error => {
            Logger.error(
               'events/nounsCandidateForumUpdate.js: Cannot send embed.',
               {
                  error: error,
                  threadId: thread.id,
                  guildId: thread.guildId,
               },
            );
         });

      Logger.info('Successfully sent forum embed.');
   },
};
