const { TextChannel } = require('discord.js');

const { findPollMessage } = require('../../../helpers/poll/thread');
const Logger = require('../../../helpers/logger');
const { generateThreadVoteEmbed } = require('../../../views/embeds/threads');

module.exports = {
   name: 'threadVote',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, vote) {
      const Nouns = await channel.client.libraries.get('Nouns');

      try {
         const threadEmbed = await generateThreadVoteEmbed(vote, Nouns);
         const pollMessage = await findPollMessage(channel, vote.proposalId);
         if (!pollMessage) {
            return;
         }
         await pollMessage.thread.send({
            content: null,
            embeds: [threadEmbed],
         });
      } catch (error) {
         return Logger.error('events/poll/threadVote.js: Received error.', {
            error: error,
            channelId: channel.id,
            guildId: channel.guildId,
         });
      }

      Logger.info(
         'events/customEvents/poll/threadVote.js: Finished sending a thread vote.',
         {
            channelId: channel.id,
            guildId: channel.guildId,
            proposalId: Number(vote.proposalId),
            voterId: vote.voter.id,
            votes: Number(vote.votes),
         },
      );
   },
};
