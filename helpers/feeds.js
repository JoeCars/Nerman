const { inlineCode } = require('discord.js');
const events = require('../utils/feedEvents');

/**
 * @param {string} group
 * @returns
 */
exports.filterEvents = function (group) {
   return [...events.entries()]
      .filter(pair => {
         const eventGroup = pair[1].split('.')[0];
         const isNouns = eventGroup === group;

         return isNouns;
      })
      .map(([key, value]) => {
         return { name: value, value: key };
      });
};

exports.formatResultMessage = function (eventResults, channel) {
   let resultMessage = '';

   let failedEvents = eventResults.filter(({ isDuplicate }) => {
      return isDuplicate;
   });
   if (failedEvents.length > 0) {
      failedEvents = failedEvents
         .map(result => {
            return inlineCode(events.get(result.event));
         })
         .join(', ');
      resultMessage += failedEvents + ' events were already registered.\n';
   }

   let successfulEvents = eventResults.filter(({ isDuplicate }) => {
      return !isDuplicate;
   });
   if (successfulEvents.length > 0) {
      successfulEvents = successfulEvents
         .map(result => {
            return inlineCode(events.get(result.event));
         })
         .join(', ');
      resultMessage += `You have successfully registered ${successfulEvents} to channel ${inlineCode(
         channel.id,
      )}.`;
   }

   return resultMessage;
};
