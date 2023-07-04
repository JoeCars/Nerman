const { TextChannel } = require('discord.js');

const Poll = require('../../../db/schemas/Poll');

const Logger = require('../../../helpers/logger');
const { generateThreadVoteEmbed } = require('../../../views/embeds/threadVote');

module.exports = {
   name: 'threadVote',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, vote) {
      Logger.info(
         'events/customEvents/poll/threadVote.js: Sending a thread vote.',
         {
            channelId: channel.id,
            proposalId: Number(vote.proposalId),
            voterId: vote.voter.id,
            votes: Number(vote.votes),
         },
      );

      const Nouns = await channel.client.libraries.get('Nouns');
      const threadEmbed = await generateThreadVoteEmbed(vote, Nouns);

      const pollMessage = await findPollMessage(channel, vote);

      if (!pollMessage) {
         return;
      }

      await pollMessage.thread.send({
         content: null,
         embeds: [threadEmbed],
      });

      Logger.info(
         'events/customEvents/poll/threadVote.js: Finished sending a thread vote.',
         {
            channelId: channel.id,
            proposalId: Number(vote.proposalId),
            voterId: vote.voter.id,
            votes: Number(vote.votes),
         },
      );
   },
};

/**
 * @param {TextChannel} channel
 */
async function findPollMessage(channel, vote) {
   // Finding poll.
   const propRegExp = new RegExp(`^prop\\s${Number(vote.proposalId)}`, 'i');
   const poll = await Poll.findOne({
      'pollData.title': { $regex: propRegExp },
      guildId: channel.guildId,
      'config.channelId': channel.id,
   })
      .populate('config')
      .exec();

   if (!poll) {
      return Logger.warn(
         'events/customEvents/poll/threadVote.js: Unable to find the poll in this channel.',
         {
            channelId: channel.id,
            proposalId: Number(vote.proposalId),
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
         'events/customEvents/poll/threadVote.js: Unable to find the poll message.',
         {
            error: error,
         },
      );
   }

   return pollMessage;
}
