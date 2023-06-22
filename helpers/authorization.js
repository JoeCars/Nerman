exports.isUserAuthorized = function isUserAuthorized(userId) {
   // FIXME: will need to remove these after we figure out a better permission control for admin command
   const authorizedIds = process.env.BAD_BITCHES.split(',');
   return authorizedIds.includes(userId);
};
