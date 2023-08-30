const { TextChannel } = require('discord.js');

const Logger = require('../../../helpers/logger');
const {
   generateSignatureAddedEmbed,
} = require('../../../views/embeds/signatureAdded');

module.exports = {
   name: 'signatureAdded',
   /**
    * @param {TextChannel} channel
    * @param {{slug: string, proposer: {id: string, name: string}, signer: {id: string, name: string}, reason: string, votes: number}} data
    *
    */
   async execute(channel, data) {
      try {
         const embed = generateSignatureAddedEmbed(data);
         await channel.send({
            content: null,
            embeds: [embed],
         });
      } catch (error) {
         return Logger.error(
            'events/nouns/signatureAdded.js: Received an error.',
            {
               error: error,
               channelId: channel.id,
               guildId: channel.guildId,
            },
         );
      }

      Logger.info(
         'events/nouns/signatureAdded.js: Finished generating proposalCandidateCreated embed.',
         {
            proposalSlug: data.slug,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   },
};
