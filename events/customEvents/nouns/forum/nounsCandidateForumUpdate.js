const { ThreadChannel } = require('discord.js');
const UrlConfig = require('../../../../db/schemas/UrlConfig');
const {
   generateCandidateFeedbackSentEmbed,
} = require('../../../../views/embeds/candidateFeedbackSent');
const {
   generateProposalCandidateCanceledEmbed,
} = require('../../../../views/embeds/proposalCandidateCanceled');
const {
   generateProposalCandidateCreatedEmbed,
} = require('../../../../views/embeds/proposalCandidateCreated');
const {
   generateProposalCandidateUpdatedEmbed,
} = require('../../../../views/embeds/proposalCandidateUpdated');
const {
   generateSignatureAddedEmbed,
} = require('../../../../views/embeds/signatureAdded');
const Logger = require('../../../../helpers/logger');

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

      thread.send({
         embeds: [embed],
      });

      Logger.info('Successfully sent forum embed.');
   },
};
