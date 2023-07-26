const { TextChannel } = require('discord.js');
const delegateChanged = require('./delegateChanged');

module.exports = {
   name: 'delegateChangedNoZero',
   /**
    * @param {TextChannel} channel
    */
   async execute(channel, data) {
      // The logic is identical, but we ignore 0 vote changes.
      if (data.numOfVotesChanged !== 0) {
         delegateChanged.execute(channel, data);
      }
   },
};
