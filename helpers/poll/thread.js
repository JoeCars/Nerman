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
   const propRegExp = new RegExp(`^Prop\\s${Number(proposalId)}`, 'i');
   const polls = await Poll.find({
      'pollData.title': { $regex: propRegExp },
      guildId: channel.guildId,
   })
      .populate('config')
      .exec();

   Logger.debug('helpers/poll/thread.js: Looking at polls.', {
      polls: polls,
   });

   const poll = polls.find(item => {
      return item.config.channelId === channel.id;
   });

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
