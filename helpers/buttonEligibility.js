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

   const pollCreationTimestamp = Date.parse(attachedPoll.timeCreated);
   if (joinedTimestamp > pollCreationTimestamp) {
      return {
         message: `You are not eligible to participate in polls posted before your arrival:\nPoll posted on: <t:${Math.round(
            pollCreationTimestamp / 1000,
         )}:F>\nDate you joined: <t:${Math.round(joinedTimestamp / 1000)}>`,
         isEligible: false,
      };
   }

   return {
      message: 'You are eligible to participate in this pole.',
      isEligible: true,
   };
};
