const { TextChannel } = require('discord.js');

const UrlConfig = require('../../db/schemas/UrlConfig');
const Logger = require('../../helpers/logger');
const embeds = require('../../views/embeds/contracts/nouns-dao');

module.exports = {
   name: 'nouns-dao',

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
         let secondaryEmbed;

         switch (data.eventName) {
            case 'EscrowedToFork':
               embed = embeds.generateEscrowedToForkEmbed(data);
               break;
            case 'ExecuteFork':
               embed = embeds.generateExecuteForkEmbed(data);
               break;
            case 'JoinFork':
               embed = embed = embeds.generateJoinForkEmbed(data);
               break;
            case 'PropCreated':
               embed = embeds.generatePropCreatedEmbed(data, urls.propUrl);
               break;
            case 'PropStatusChange':
               embed = embeds.generatePropStatusChangeEmbed(data, urls.propUrl);
               break;
            case 'PropVoteCast':
               embed = embeds.generatePropVoteCastEmbed(
                  data,
                  urls.propUrl,
                  false,
               );
               secondaryEmbed = embeds.generatePropVoteCastEmbed(
                  data,
                  urls.propUrl,
                  true,
               );
               break;
            case 'WithdrawNounsFromEscrow':
               embed = embeds.generateWithdrawNounsFromEscrowEmbed(data);
               break;
            default:
               throw new Error(
                  'Event name does not match any supported Nouns DAO events.',
               );
         }

         const message = await channel.send({ embeds: [embed] });
         if (secondaryEmbed) {
            await message.edit({ embeds: [secondaryEmbed] });
         }

         Logger.info(`events/nouns/nouns-dao.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         if (error.code === 50001) {
            Logger.debug('events/nouns/nouns-dao.js: Missing permissions.', {
               eventName: data.eventName,
               channelId: channel.id,
               guildId: channel.guildId,
            });
         } else {
            Logger.error('events/nouns/nouns-dao.js: Received error.', {
               error: error,
               eventName: data.eventName,
               channelId: channel.id,
               guildId: channel.guildId,
            });
         }
      }
   },
};
