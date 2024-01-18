const { TextChannel } = require('discord.js');

const FeedConfig = require('../../db/schemas/FeedConfig');
const Logger = require('../../helpers/logger');
const embeds = require('../../views/embeds/contracts/prop-house');

module.exports = {
   name: 'prop-house',

   /**
    * @param {TextChannel} channel
    * @param {{
    *    eventName: string
    *    house: { id: string }
    * }} data
    */
   async execute(channel, data) {
      try {
         const camelCaseEventName =
            data.eventName.substring(0, 1).toLowerCase() +
            data.eventName.substring(1);
         const houseFilter = await FeedConfig.findOne({
            guildId: channel.guildId,
            channelId: channel.id,
            eventName: camelCaseEventName,
         }).exec();

         if (houseFilter && !houseFilter.includesHouse(data.house.id)) {
            return;
         }

         let embed;

         switch (data.eventName) {
            case 'PropHouseRoundCreated':
               embed = embeds.generateRoundCreatedEmbed(data);
               break;
            case 'PropHouseHouseCreated':
               embed = embeds.generateHouseCreatedEmbed(data);
               break;
            case 'PropHouseVoteCast':
               embed = embeds.generateVoteCastEmbed(data);
               break;
            case 'PropHouseProposalSubmitted':
               embed = embeds.generateProposalSubmittedEmbed(data);
               break;
            default:
               throw new Error(
                  `Event name does not match any supported PropHouse events.`,
               );
         }

         await channel.send({ embeds: [embed] });

         Logger.info(`events/nouns/prop-house.js: Finished sending embed.`, {
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      } catch (error) {
         Logger.error('events/nouns/prop-house.js: Received error.', {
            error: error,
            eventName: data.eventName,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }
   },
};
