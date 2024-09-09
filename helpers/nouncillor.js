const Nouncillor = require('../db/schemas/Nouncillor');
const Poll = require('../db/schemas/Poll');
const PollChannel = require('../db/schemas/PollChannel');

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
   await addNouncillorDateJoined(nouncillorDiscordIds);

   const oldAllowedDiscordIds = await fetchAllCurrentlyEligibleNouncillorIds();
   const newlyIneligibleDiscordIds = await findNewlyIneligibleDiscordIds(
      oldAllowedDiscordIds,
      nouncillorDiscordIds,
   );
   for (const discordId of newlyIneligibleDiscordIds) {
      await removeNouncillorDateJoined(discordId);
   }
};

/**
 * @param {string[]} nouncillorDiscordIds
 */
async function addNouncillorDateJoined(nouncillorDiscordIds) {
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
}

async function fetchAllCurrentlyEligibleNouncillorIds() {
   const eligibleNouncillors = await Nouncillor.find({
      dateJoined: { $ne: null },
   })
      .lean()
      .exec();
   const discordIds = eligibleNouncillors.map(
      nouncillor => nouncillor.discordId,
   );
   return discordIds;
}

async function fetchAllowedUsersFromNewestNouncilPoll() {
   const nouncilConfig = await PollChannel.findOne({
      channelId: process.env.NOUNCIL_CHANNEL_ID,
   }).exec();
   if (!nouncilConfig) {
      throw new Error('unable to find nouncil poll channel in the db');
   }
   const newestPoll = await Poll.findOne({ config: nouncilConfig._id })
      .sort({
         timeCreated: 'desc',
      })
      .exec();
   if (!newestPoll) {
      return [];
   }

   return [...newestPoll.allowedUsers.keys()];
}

/**
 * @param {string[]} oldAllowedDiscordIds
 * @param {string[]} newAllowedDiscordIds
 */
function findNewlyIneligibleDiscordIds(
   oldAllowedDiscordIds,
   newAllowedDiscordIds,
) {
   const newlyIneligibleDiscordIds = oldAllowedDiscordIds.filter(discordId => {
      return !newAllowedDiscordIds.includes(discordId);
   });
   return newlyIneligibleDiscordIds;
}

/**
 * @param {string} discordId
 */
async function removeNouncillorDateJoined(discordId) {
   let nouncillor = await Nouncillor.findOne({
      discordId: discordId,
   }).exec();

   if (!nouncillor) {
      nouncillor = new Nouncillor({ discordId });
   }

   if (nouncillor.dateJoined) {
      nouncillor.dateJoined = null;
      await nouncillor.save();
   }
}
