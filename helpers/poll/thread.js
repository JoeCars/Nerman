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
   // Finding relevant polls in guild.
   const propRegExp = new RegExp(`^Prop\\s${Number(proposalId)}`, 'i');
   const polls = await Poll.find({
      'pollData.title': { $regex: propRegExp },
      guildId: channel.guildId,
   })
      .populate('config')
      .exec();

   // Finding poll in channel.
   let targetPoll = undefined;
   for (let i = 0; i < polls.length; ++i) {
      if (polls[i].config.channelId === channel.id) {
         targetPoll = polls[i];
         break;
      }
   }

   if (!targetPoll) {
      return Logger.warn(
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
      pollMessage = await (channel.messages.cache.get(targetPoll.messageId) ??
         channel.messages.fetch(targetPoll.messageId));
   } catch (error) {
      Poll.findOneAndRemove({ _id: targetPoll._id })
         .exec()
         .then(() => {
            Logger.info('helpers/poll/thread.js: Deleted unused poll.', {
               _id: targetPoll._id,
               proposalId: proposalId,
            });
         })
         .catch(err => {
            Logger.error(
               'helpers/poll/thread.js: Unable to delete unused poll.',
               {
                  error: err,
               },
            );
         });

      return Logger.error(
         'helpers/poll/thread.js: Unable to find the poll message.',
         {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         },
      );
   }

   return pollMessage;
};
