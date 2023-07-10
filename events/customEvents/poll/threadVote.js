const { TextChannel } = require('discord.js');

const { findPollMessage } = require('../../../helpers/poll/thread');
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

      const pollMessage = await findPollMessage(channel, vote.proposalId);

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
