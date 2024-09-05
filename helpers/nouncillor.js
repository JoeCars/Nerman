const Nouncillor = require('../db/schemas/Nouncillor');

/**
 * @param {string} channelId
 */
exports.isNouncilChannel = function isNouncilChannel(channelId) {
   return channelId === process.env.NOUNCIL_CHANNEL_ID;
};

/**
 * @param {string[]} nouncillorDiscordIds
 */
exports.updateNouncillorDateJoined = async function updateNouncillorDateJoined(
   nouncillorDiscordIds,
) {
   for (const discordId of nouncillorDiscordIds) {
      let nouncillor = await Nouncillor.findOne({
         discordId: discordId,
      }).exec();

      if (!nouncillor) {
         nouncillor = new Nouncillor({ discordId });
      }

      if (!nouncillor.dateJoined) {
         nouncillor.dateJoined = new Date();
         await nouncillor.save();
      }
   }
};
