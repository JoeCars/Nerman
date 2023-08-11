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

   let poll = undefined;
   for (let i = 0; i < polls.length; ++i) {
      try {
         const message = channel.messages.fetch(polls[i].messageId);
         if (message) {
            Logger.debug(
               'Checking if the config channel id matches the channel id.',
               {
                  configChannelId: polls[i].config.channelId,
                  channelId: channel.id,
                  isEqual: polls[i].config.channelId === channel.id,
               },
            );

            poll = polls[i];
            break;
         }
      } catch (error) {
         console.error('No message found.');
      }
   }

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
