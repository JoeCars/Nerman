const { TextChannel } = require('discord.js');

const UrlConfig = require('../../db/schemas/UrlConfig');
const Logger = require('../../helpers/logger');
const embeds = require('../../views/embeds/contracts/nouns-dao-data');

module.exports = {
   name: 'nouns-dao-data',

   /**
    * @param {TextChannel} channel
    * @param {{
    *    eventName: string
    * }} data
    */
   async execute(channel, data) {
      try {
         const urls = await UrlConfig.fetchUrls(channel.guildId);
         let embed;

         switch (data.eventName) {
            case 'CandidateFeedbackSent':
               embed = embeds.generateCandidateFeedbackSentEmbed(data);
               break;
            case 'FeedbackSent':
               embed = embeds.generateFeedbackSentEmbed(data, urls.propUrl);
               break;
            case 'ProposalCandidateCanceled':
               embed = embeds.generateProposalCandidateCanceledEmbed(data);
               break;
            case 'ProposalCandidateCreated':
               embed = embeds.generateProposalCandidateCreatedEmbed(data);
               break;
            case 'ProposalCandidateUpdated':
               embed = embeds.generateProposalCandidateUpdatedEmbed(data);
               break;
            case 'SignatureAdded':
               embed = embeds.generateSignatureAddedEmbed(data);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Nouns DAO Data events.',
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(
            `events/nouns/nouns-dao-data.js: Finished sending embed.`,
            {
               eventName: data.eventName,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      } catch (error) {
         Logger.error('events/nouns/nouns-dao-data.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
