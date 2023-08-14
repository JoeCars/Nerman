const { TextChannel } = require('discord.js');
const propVoteCast = require('./propVoteCast');

module.exports = {
   name: 'propVoteCastOnlyZero',
   /**
    * @param {TextChannel} channel
    * @param {{proposalId: string,
    *    voter: {id: string, name: string},
    *    choice: string,
    *    proposalTitle: string,
    *    votes: number,
    *    supportDetailed: number,
    *    reason: string}} vote
    */
   async execute(channel, vote) {
      propVoteCast.execute(channel, vote);
   },
};
