exports.checkUserEligibility = async function checkUserEligibility(
   roleCache,
   allowedRoles,
   attachedPoll,
   userId,
   joinedTimestamp,
) {
   if (!roleCache.hasAny(...allowedRoles)) {
      return {
         message: 'You do not have a role eligible to vote on this poll.',
         isEligible: false,
      };
   }

   if (attachedPoll.allowedUsers.get(userId) === true) {
      return {
         message: 'You have already used up your vote allowance.',
         isEligible: false,
      };
   }

   if (!attachedPoll.allowedUsers.has(userId)) {
      return {
         message: `You are not eligible to participate in this poll. You were either absent from the Discord server, or lacked an appropriate role, when the poll was created.\nPoll posted on: <t:${Math.round(
            Date.parse(attachedPoll.timeCreated) / 1000,
         )}:F>`,
         isEligible: false,
      };
   }

   return {
      message: 'You are eligible to participate in this pole.',
      isEligible: true,
   };
};
