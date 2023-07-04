const { TextChannel } = require('discord.js');
const Logger = require('../logger');
const Poll = require('../../db/schemas/Poll');

/**
 *
 * @param {TextChannel} channel
 * @param {*} proposalId
 * @returns
 */
exports.findPollMessage = async function (channel, proposalId) {
   // Finding poll.
   const propRegExp = new RegExp(`^prop\\s${Number(proposalId)}`, 'i');
   const poll = await Poll.findOne({
      'pollData.title': { $regex: propRegExp },
      guildId: channel.guildId,
      'config.channelId': channel.id,
   })
      .populate('config')
      .exec();

   if (!poll) {
      return Logger.error(
         'helpers/poll/thread.js: Unable to find the poll in this channel.',
         {
            channelId: channel.id,
            proposalId: Number(proposalId),
         },
      );
   }

   // Grabbing poll message.
   let pollMessage = null;

   try {
      pollMessage = await (channel.messages.cache.get(poll.messageId) ??
         channel.messages.fetch(poll.messageId));
   } catch (error) {
      return Logger.error(
         'helpers/poll/thread.js: Unable to find the poll message.',
         {
            error: error,
         },
      );
   }

   return pollMessage;
};
